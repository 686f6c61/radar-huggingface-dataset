# MarianRzydek/phasmophobia-fling-trainer

## Resumen

El repositorio `MarianRzydek/phasmophobia-fling-trainer` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 (un binario `.exe` dentro de un archivo `.zip` de 4,8 MB) que la propia model card describe como un "game cheat" o entrenador para el videojuego Phasmophobia, con funciones de overlay externo, radar 2D, ESP de cajas delimitadoras y esqueletos, suavizado de entrada por curvas de Bezier y una tecla de pánico para descargar el proceso. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La ficha se conserva por rigor documental: el artefacto aparece alojado en Hugging Face con la etiqueta de licencia MIT y una lista de idiomas que corresponde a los idiomas de la interfaz del ejecutable, no a capacidades lingüísticas de un modelo. Cualquier evaluación como modelo de lenguaje, visión o agentes carece de sentido técnico, ya que no existe ningún parámetro entrenado que evaluar.

Por tanto, todos los apartados que siguen reflejan la ausencia de información propia de un modelo de IA y describen, cuando procede, las características del binario según la model card. Se recomienda precaución: la distribución de ejecutables ofuscados con contraseña de archivo y petición de ejecución como administrador es un patrón habitual en campañas de malware, y la propia model card reconoce que los antivirus pueden marcarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable nativo Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible; el artefacto distribuido es un `.zip` con un `.exe` (4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows 10/11 de 64 bits que, según la model card, opera en modo usuario ("user-mode external core") mediante Desktop Duplication para renderizar un overlay sin inyectar DLL en el proceso del juego. El binario se distribuye comprimido en `delta-executor-pc-2026-v1.2.2-win64.zip` con contraseña de extracción `2026`, y la model card indica que debe ejecutarse como administrador.

La model card menciona métricas de rendimiento del binario (respuesta en menos de 14 ms para la capa de render, sondeo a 247 Hz para el overlay, 271 Hz para el suavizado de entrada y 342 Hz para el núcleo externo), pero no aporta ninguna información sobre datasets, tokens de entrenamiento, RLHF, DPO ni innovaciones de modelado. No hay pesos publicados en safetensors, GGUF ni ningún otro formato de tensor.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve problemas matemáticos ni escribe código.
- No dispone de tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido de modelado; los códigos de idioma del repositorio parecen referirse a la localización de la interfaz del ejecutable.
- No incluye visión, audio ni modo de pensamiento.
- Funcionalidad declarada del binario: overlay externo con cajas 2D/3D, esqueletos y ESP de distancia; radar 2D con filtrado de objetos por rareza; suavizado de entrada por curvas de Bezier con radio de FOV configurable y comprobación de visibilidad; exclusión de captura de pantalla para OBS, ShadowPlay y Discord; tecla de pánico `END` para descargar el proceso.

## Casos de uso

- No aplica ningún caso de uso como modelo de IA: no hay inferencia, generación ni procesamiento de lenguaje que integrar en pipelines.
- Auditoría de seguridad: el artefacto puede analizarse en un entorno aislado para estudiar técnicas de overlay externo, ofuscación con contraseña de archivo y evasión de captura de pantalla.
- Formación en detección de malware: sirve como ejemplo de repositorio con etiquetas de modelo, licencia MIT y lista de idiomas que en realidad distribuye un ejecutable potencialmente no deseado.
- Investigación de políticas de plataforma: caso de estudio sobre moderación de contenido en Hugging Face cuando se suben binarios ajenos al ecosistema de modelos.
- No se recomienda su uso para ninguna finalidad relacionada con el juego Phasmophobia, ya que modificar un juego multijugador puede infringir sus términos de servicio y acarrear el bloqueo de la cuenta.
- No se recomienda su ejecución en máquinas de producción, desarrollo ni personales por el riesgo de seguridad inherente a ejecutar binarios ofuscados como administrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas cifras de rendimiento que aparecen en la model card son métricas del binario, no de un modelo de IA: respuesta de render inferior a 14 ms, sondeo del overlay a 247 Hz, suavizado de entrada a 271 Hz y núcleo externo a 342 Hz. No son verificables ni comparables con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- VRAM: no aplica; no hay pesos de modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica; el binario declara funcionar mediante Desktop Duplication, sin requisitos de GPU publicados.
- Compatibilidad con GPU de consumo: no disponible; la model card solo indica Windows 10/11 de 64 bits en procesadores Intel y AMD x64.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes para un ejecutable de Windows).
- Latencia y throughput: las cifras declaradas por el autor (14 ms, 247 Hz, 271 Hz, 342 Hz) no han sido verificadas de forma independiente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MarianRzydek/phasmophobia-fling-trainer | Ejecutable Windows x64 (no es modelo de IA) | no aplica | no aplica | MIT | Hugging Face, 0 descargas, 0 likes |
| Modelos de lenguaje open source (p. ej. familias Llama, Mistral, Qwen) | Modelo de IA con pesos | miles de millones | miles de tokens | variable | Hugging Face, amplia adopción |
| Herramientas legítimas de modding de juegos | Utilidades de código abierto | no aplica | no aplica | variable | Repositorios públicos |

No existe un modelo comparable en la categoría de modelos de IA. La comparación con modelos de lenguaje solo procede para señalar que este artefacto no pertenece a esa categoría.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con métricas de MMLU, HumanEval, GSM8K ni similares.
- Riesgo de seguridad elevado: distribución de un `.exe` ofuscado dentro de un `.zip` protegido con contraseña y con instrucciones para ejecutarlo como administrador, un patrón habitual en campañas de malware.
- La model card reconoce explícitamente que Windows Defender y SmartScreen pueden marcarlo y recomienda desactivar las alertas, lo que agrava el riesgo.
- El binario declara funcionalidades de trampa en un juego multijugador, lo que puede infringir los términos de servicio de Phasmophobia y provocar sanciones en la cuenta.
- La licencia MIT del repositorio no garantiza la legalidad ni la seguridad del binario distribuido; la licencia cubre el contenido del repositorio, no la ausencia de código malicioso.
- No hay verificación independiente de las métricas de rendimiento declaradas por el autor.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- No apto para uso comercial, producción ni entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MarianRzydek/phasmophobia-fling-trainer
- Enlace de descarga citado en la model card: https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Repositorio de releases citado en la model card: https://github.com/Kimura71/phasmophobia-fling-trainer/releases/latest
