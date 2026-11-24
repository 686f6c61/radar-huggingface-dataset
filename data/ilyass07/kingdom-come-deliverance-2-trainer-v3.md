# Ilyass07/kingdom-come-deliverance-2-trainer-v3

## Resumen

El repositorio `Ilyass07/kingdom-come-deliverance-2-trainer-v3` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows presentado como "trainer" (herramienta de trampas o modificación de memoria) del videojuego *Kingdom Come: Deliverance 2*. El artefacto distribuido es un archivo ZIP de 4,8 MB con un ejecutable `.exe` (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`) y un binario adicional, etiquetado con las tags `windows`, `windows-11`, `x64` y `portable`.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni pesos en formato safetensors o GGUF. La model card describe funcionalidades propias de un cheat externo para videojuegos: overlay con cajas delimitadoras, ESP de distancia, suavizado de entrada tipo Bézier, escáner de offsets dinámicos y perfiles JSON intercambiables en caliente. El contenido está redactado con un estilo promocional típico de campañas de distribución de software potencialmente no deseado.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA. Se documenta lo que el autor declara y se advierte de los riesgos asociados a su descarga y ejecución. Cualquier uso en producción o en investigación queda fuera de lugar: no es un modelo, no expone una API de inferencia y su licencia MIT declarada no cubre el contenido de terceros ni los riesgos de seguridad del binario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según tags; no verificable) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (el artefacto es un ZIP con `.exe` y binarios; no hay safetensors ni GGUF) |
| Plataforma objetivo | Windows 10/11 64-bit |
| Tamaño del paquete | 4,8 MB (ZIP) |
| Build declarado | v2.8.5 (38EB36) |
| Contraseña del ZIP | `2026` (declarada en la model card) |
| Pipeline de Hugging Face | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-24 |
| Fecha de actualización | 2026-11-24 |

## Arquitectura y entrenamiento

No aplica. El artefacto no es una red neuronal ni un modelo entrenado: no hay información sobre datos de entrenamiento, tokens, composición del dataset, RLHF, DPO ni innovaciones de arquitectura (transformer, MoE, SSM, híbrida). La model card describe un ejecutable que, según el autor, opera en modo usuario externo sobre el proceso del juego, con polling a 475 Hz, overlay asíncrono a 144 Hz y renderizado mediante Desktop Duplication sin hooks DLL internos. Estas afirmaciones no son verificables a partir de los metadatos públicos y no constituyen una descripción de arquitectura de modelo.

Desde el punto de vista técnico, un "trainer" de este tipo suele implementarse como un proceso que lee y escribe memoria de otro proceso (el juego) mediante `ReadProcessMemory`/`WriteProcessMemory`, resuelve punteros con firmas y aplica parches en tiempo de ejecución. Nada de ello implica un modelo de lenguaje, visión o multimodal. La etiqueta `pipeline` de Hugging Face está vacía, lo que confirma que el Hub no lo reconoce como modelo.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües en el sentido de un modelo: los idiomas listados son etiquetas de la model card, no idiomas de inferencia.
- Las "capacidades" declaradas por el autor son funcionalidades de un cheat para videojuegos:
  - Overlay externo con cajas 2D/3D, esqueletos de huesos y ESP de distancia.
  - Suavizado de entrada Bézier con curvas humanizadas y radio FOV configurable.
  - Escáner de offsets dinámicos con resolución automática de firmas de punteros.
  - Perfiles JSON intercambiables con una tecla (presets Legit, Visual, Custom).
  - Tecla de pánico `END` para descarga inmediata del proceso.
  - Ejecución en modo usuario sin inyección de DLL interna, según el autor.

## Casos de uso

No procede recomendar casos de uso para un modelo de IA porque no lo es. Los escenarios que el autor sugiere son de modificación de un videojuego y conllevan riesgos legales, de seguridad y de integridad de cuenta. Se documentan únicamente a título descriptivo:

- Modificación de partidas guardadas de *Kingdom Come: Deliverance 2*: el autor afirma que el ejecutable permite alterar valores del juego en memoria; no hay verificación independiente.
- Overlay informativo sobre el juego: según la model card, muestra cajas delimitadoras y distancias; requeriría ejecutar un binario de origen no auditado.
- Automatización de macros: el nombre del ejecutable (`fisch-script-auto-catch-macro`) sugiere funciones de macro, aunque no se detalla su comportamiento real.
- Perfiles de configuración intercambiables: el autor describe presets JSON; su utilidad práctica depende de un formato no documentado públicamente.
- Distribución en entornos Windows 10/11: el paquete se presenta como portable, pero incluye una contraseña de descompresión que dificulta el análisis automático.
- Integración en pipelines de CI/CD o producción: no aplicable; no hay API, SDK ni pesos que cargar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor incluye métricas internas no verificables (polling a 475 Hz, consistencia del 99,1 % en cambio de perfiles, 98,2 % en el core externo, respuesta del overlay inferior a 5 ms), que no son comparables con benchmarks de modelos de IA como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica; el autor solo menciona Windows 10/11 64-bit.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor (475 Hz de polling, <5 ms de overlay) no son verificables ni equivalentes a métricas de inferencia.
- Requisitos reales del artefacto: sistema Windows 10/11 de 64 bits, 7-Zip o WinRAR para extraer el ZIP con contraseña `2026`, y privilegios de administrador según las instrucciones del autor.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco procede compararlo con trainers de videojuegos de otros repositorios, ya que no se dispone de información verificable sobre ellos en la documentación proporcionada.

| Criterio | Este artefacto | Modelo de IA típico (referencia) |
|---|---|---|
| Naturaleza | Ejecutable Windows (ZIP + `.exe`) | Pesos en safetensors/GGUF |
| Pesos | No disponibles | Safetensors, GGUF, etc. |
| Licencia | MIT declarada | Variable (Apache-2.0, Llama, MIT, etc.) |
| Inferencia | No aplica | API local o remota |
| Benchmarks | No disponibles | MMLU, HumanEval, GSM8K, etc. |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o producción.
- El binario se distribuye como `.exe` de origen no auditado, con contraseña de descompresión (`2026`) que dificulta el análisis estático y los escaneos automáticos. Riesgo elevado de malware, adware o robo de credenciales.
- La model card mezcla nombres de repositorios ajenos (`hansson31102/...`, `YokoCastro3813/...`) y un nombre de ejecutable (`fisch-script-auto-catch-macro`) incoherente con el título; patrón habitual en campañas de distribución engañosa.
- Uso de trainers en videojuegos: puede violar los términos de servicio de la plataforma y del juego, con riesgo de suspensión de cuenta; también puede contravenir legislación sobre elusión de protecciones técnicas según la jurisdicción.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del binario; MIT cubre el código, no exime de responsabilidad por daños.
- No hay información sobre sesgos, alucinaciones, límites de contexto o idioma porque no hay modelo; cualquier afirmación en ese sentido sería inventada.
- Los idiomas listados (14) son etiquetas de metadatos sin verificación funcional.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Fecha de creación en 2026-11-24, posterior a la fecha actual de muchos entornos de evaluación; conviene verificar la coherencia temporal antes de cualquier análisis.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ilyass07/kingdom-come-deliverance-2-trainer-v3
- Repositorio GitHub referenciado en la model card (no verificado): https://github.com/hansson31102/kingdom-come-deliverance-2-trainer-v3
- Releases del repositorio GitHub referenciado (no verificado): https://github.com/hansson31102/kingdom-come-deliverance-2-trainer-v3/releases/latest
- Enlace de descarga del ZIP citado en la model card (no verificado, no recomendado): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
