# Russ1on/MiniMax-H3-Multishot-Workflow

## Resumen

MiniMax-H3 Multishot Workflow es un paquete de nodos personalizados para ComfyUI, junto con tres grafos de trabajo listos para cargar, desarrollado por el usuario Russ1on. No contiene pesos de modelo: es exclusivamente infraestructura de orquestación que permite encadenar bloques de generación de vídeo de MiniMax-H3 (de aproximadamente 10-15 segundos cada uno) para producir escenas de múltiples planos como una única toma continua, sin cortes visibles, sin saltos de color y con audio continuo a lo largo de toda la pieza.

El problema que resuelve es concreto: MiniMax-H3 genera nativamente fragmentos cortos, y empalmarlos de forma ingenua produce discontinuidades visuales y sonoras en cada unión. Este pack implementa sistemas de memoria, anclajes de fotograma clave, niveles de textura y color posteriores al encadenado, referencias de voz por personaje y un escritor de prompts basado en LLM que reparte un discurso continuo entre ventanas en los límites de frase. La versión documentada es la 2.7.0 del pack ComfyUI-H3-Multishot.

La relevancia actual del repositorio es la de una herramienta de producción para flujos de vídeo generativo de formato largo en hardware de consumo: incluye reglas automáticas de gestión de memoria para GPUs de 16-24 GB, decodificación preliminar rápida con un decoder TAE de 9 MB, y soporte para ComfyUI 0.34. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: paquete de nodos ComfyUI y grafos de trabajo para orquestar MiniMax-H3 (modelo subyacente no incluido) |
| Parametros totales | No disponible (no se distribuyen pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible; el encadenado permite escenas de duración arbitraria mediante ventanas sucesivas |
| Tipos de cuantizacion | No disponible en el repositorio; la model card menciona cuantizaciones GGUF del checkpoint MiniMax-H3 alojadas externamente (joeygambino/Min...) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No contiene pesos; los grafos son JSON de ComfyUI y el pack es código de nodos personalizados |

## Arquitectura y entrenamiento

Este repositorio no entrena ni distribuye un modelo generativo. Es un pack de nodos para ComfyUI que envuelve y orquesta MiniMax-H3, un modelo de generación texto-a-vídeo con audio. La arquitectura del modelo subyacente no se describe en la información disponible; lo que sí se documenta es la capa de control construida encima.

Los componentes técnicos del pack incluyen: samplers y cargadores específicos de H3, controles de estudio, una pila de LoRA y un parche de arquitectura para GGUF. Sobre esa base se añaden sistemas de memoria y continuidad: un banco de memoria que se desactiva automáticamente en cadenas `flf_chain` para evitar que la placa del plano 1 se filtre en planos posteriores, anclajes de fotograma clave nativos detectados en ComfyUI 0.34, un nivelador de textura y color posterior al encadenado (`H3ChainNormalize`), alineación de empalmes `refresh_pin`, una ventana de recorte `x0_clamp_window` con tope de dosis de 0.30, escalado latente en bucle, `refresh_renoise`, `pin_noise_ramp` y `auto_chunk_ffn`. La versión 2.5 introdujo cuatro sistemas de memoria medidos: la regla automática de margen del driver (que evita la degradación de memoria de GPU en Windows cuando la tarjeta supera aproximadamente el 95% de ocupación), `low_ram_master` (vuelca planos terminados a disco sin pérdida, con una diferencia de 42,8 dB frente a la ruta en RAM), un codificador de texto remoto ejecutable en un segundo PC con ComfyUI y caché local, y `H3 TAE Decode`, un decoder diminuto de 9 MB para previsualizaciones en dos segundos. La versión 2.6 añadió el modo "extend take", que escribe un único discurso continuo y lo corta entre ventanas en límites de frase, manteniendo la continuidad bajo `context_pin` con la propia voz de H3, sin TTS.

## Capacidades

- Encadenado de bloques de vídeo de MiniMax-H3 (10-15 segundos cada uno) en escenas de duración arbitraria con una única pista maestra de vídeo y audio.
- Continuidad visual en las uniones: sin corte visible y sin desplazamiento de color entre planos.
- Continuidad de audio a lo largo de toda la pieza encadenada.
- Referencias de voz por sujeto (`voice_ref_2`, `voice_ref_3`) en ambos samplers, con verificación a ciegas de ausencia de sangrado entre hablantes.
- Modo "extend take": un solo prompt y un solo discurso continuo repartido automáticamente entre ventanas en límites de frase.
- Escritor de prompts basado en LLM con estilos de unión diferenciados, incluidos prompts de sistema separados para H3 (`<d>[English] ...</d>`) y para LTX (diálogo entrecomillado) mediante un widget `engine`.
- Prioridad de fotografías de referencia sobre la prosa del escritor: el escritor apunta a las fotos en lugar de describir caras.
- Anclajes de fotograma clave en posiciones elegidas dentro de un clip (`H3_Keyframes.json`).
- Panel de aceleradores de velocidad con Spectrum, TeaCache, block cache y EasyCache, cada uno medido y evaluado visualmente.
- Previsualización preliminar rápida con `H3 TAE Decode` para búsqueda de semillas y triaje por lotes.
- Codificador de texto remoto con caché local para liberar memoria de la tarjeta de render.
- Compatibilidad con ComfyUI 0.34 y con núcleos anteriores mediante desactivación automática del parche de diseño.

## Casos de uso

- Producción de cortometrajes generativos de toma única: el pack encadena ventanas de 10-15 segundos en una escena continua de 30-65 segundos o más, con audio y color coherentes, adecuado para piezas narrativas breves sin necesidad de montaje posterior en las uniones.
- Escenas de diálogo con varios personajes: las referencias de voz por sujeto mantienen la identidad vocal de cada personaje a lo largo de toda la cadena, lo que permite generar conversaciones multi-turno sin sangrado entre hablantes.
- Generación de vídeo musical o monólogo de formato largo: el modo "extend take" escribe un discurso continuo y lo corta en límites de frase, manteniendo la prosodia bajo `context_pin` con la voz nativa de H3, sin recurrir a TTS.
- Búsqueda de semillas y triaje por lotes: `H3 TAE Decode` produce previsualizaciones a resolución completa en unos dos segundos por clip frente al minuto aproximado del VAE real, lo que acelera la exploración de variaciones antes de renderizar en calidad final.
- Render en estaciones de trabajo con GPU de consumo: los valores por defecto están ajustados para tarjetas de 16-24 GB, con `low_ram_master` para cadenas largas (el pico de RAM se reduce a unos dos planos independientemente de la longitud) y la regla automática de margen del driver que estabiliza los tiempos de render.
- Configuraciones multi-máquina: el codificador de texto remoto permite delegar esa carga (más de 15 GB retenidos entre renders) a un segundo PC con ComfyUI y este pack, con resultados idénticos verificados entre máquinas y caché local para prompts repetidos.
- Integración en flujos de postproducción con ComfyUI: los tres grafos JSON (`H3_Seamless_Chain_v2.json`, `H3_Seamless_Chain_CORE.json` sin dependencias de terceros, y `H3_Keyframes.json`) se cargan directamente y permiten anclar fotogramas en posiciones concretas para control creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos cuantitativos de rendimiento que aparecen en la model card son medidas internas de ingeniería, no comparativas de calidad: tiempos de render de 15 minutos estables tras aplicar la regla de margen del driver (frente a una horquilla previa de 27 minutos a 3 horas para trabajo idéntico), una diferencia de 42,8 dB entre la ruta `low_ram_master` y la ruta en RAM (ruido de códec), previsualizaciones de 2 segundos con el decoder TAE de 9 MB frente a aproximadamente un minuto por plano con el VAE real, y un aumento medido de aproximadamente +13% de textura fina por unión en tomas largas a 736x1280 con el conjunto antidrift activado.

## Requisitos de hardware

- VRAM: no se especifica una cifra exacta para el pack; la model card indica valores por defecto ajustados para tarjetas de 16-24 GB y menciona un laboratorio de pruebas de 24 GB.
- El codificador de texto retiene más de 15 GB durante el tiempo entre renders; puede descargarse a una segunda máquina con el nodo de codificador remoto.
- GPU recomendadas: no disponible de forma explícita; el rango objetivo declarado es de 16 a 24 GB de VRAM, lo que incluye tarjetas de consumo de gama alta de esa capacidad.
- Cabe en GPU de consumo: sí, según el rango objetivo declarado de 16-24 GB, con los valores por defecto del pack.
- Despliegue: ComfyUI (versión 0.34 soportada, con compatibilidad hacia atrás), con el pack de nodos `ComfyUI-H3-Multishot`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de herramienta.
- Latencia y throughput: render estable de 15 minutos tras la regla de margen del driver; previsualización de 2 segundos por clip con TAE Decode; aproximadamente un minuto por plano con el VAE real. No se especifica la resolución ni la GPU exacta asociada a estas cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros packs de nodos, orquestadores de vídeo o modelos de generación texto-a-vídeo, ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin descargar por separado el checkpoint MiniMax-H3 (`ref2va` o `fl2va`), las cuantizaciones GGUF, el codificador de texto, el VAE y los LoRA, el pack no es funcional.
- Límite conocido en la versión 2.6.0 y abordado en 2.7.0: el trinquete de textura de la cadena no está completamente resuelto para tomas largas; se midió un aumento de aproximadamente +13% de textura fina por unión a 736x1280 con el conjunto antidrift activado. Por debajo de unas 4 ventanas (30-40 segundos) es leve; a 7 ventanas el enfoque es visible. La recomendación documentada es mantener las tomas extendidas en torno a 4 ventanas.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de generación de vídeo, el riesgo se traslada a incoherencias visuales, deriva de identidad o diálogos no deseados, mitigados parcialmente por los anclajes y las referencias.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no disponibles; el escritor de prompts usa prompts de sistema en inglés para H3, lo que puede condicionar la calidad en otros idiomas.
- Restricciones de licencia: el pack se distribuye bajo Apache 2.0, pero la licencia del checkpoint MiniMax-H3 y de los componentes externos debe verificarse por separado antes de un uso comercial.
- Dependencia de terceros: el grafo completo (`H3_Seamless_Chain_v2.json`) incluye componentes de terceros; existe una variante CORE sin dependencias externas para entornos restringidos.
- Compatibilidad: el parche de diseño se desactiva automáticamente en ComfyUI 0.34; en versiones anteriores el comportamiento es distinto y conviene revisar `SETTINGS.md`.
- Advertencia de producción: el decoder TAE está pensado para borradores y triaje, nunca para entregas finales.
- El repositorio es de tamaño 0.0 GB, sin descargas ni valoraciones en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Russ1on/MiniMax-H3-Multishot-Workflow
- Checkpoint MiniMax-H3 y cuantizaciones GGUF: referenciados en la model card como `joeygambino/Min...` (enlace truncado en la información disponible)
- Documentación incluida en el repositorio: `INSTALL.md`, `SETTINGS.md`, `PROMPTING.md`
- Grafos de trabajo incluidos: `workflows/H3_Seamless_Chain_v2.json`, `workflows/H3_Seamless_Chain_CORE.json`, `workflows/H3_Keyframes.json`
- ComfyUI: no se proporciona enlace en la información disponible
