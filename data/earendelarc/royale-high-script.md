# EarendelArc/royale-high-script

## Resumen

El repositorio `EarendelArc/royale-high-script` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows de 64 bits etiquetado como "script" para el videojuego Roblox *Royale High*, con una model card que en realidad funciona como página de descarga de un ejecutable (`royale-high-script-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB protegido con contraseña). No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La ficha se redacta, por tanto, como evaluación técnica de un artefacto que aparece indexado en Hugging Face bajo la categoría de modelos, pero que no cumple ninguno de los criterios propios de un modelo de lenguaje o multimodal. El "autor" declarado es EarendelArc, aunque los enlaces de descarga apuntan a un repositorio de GitHub de una cuenta distinta (Brittany840), lo que constituye una discrepancia relevante desde el punto de vista de la cadena de suministro.

Es relevante ahora porque ilustra un patrón de abuso de la plataforma: repositorios con etiquetas de modelo, licencia MIT y una lista amplia de idiomas que enmascaran binarios ejecutables distribuidos con contraseña y con instrucciones para desactivar las comprobaciones de seguridad del sistema. Cualquier evaluador que automatice la selección de modelos debe poder descartar este tipo de entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin justificación técnica) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni ONNX) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto descrito en la model card es un binario compilado para Windows de 64 bits (`royale-high-script-v1.2.0-win64.exe`, build `v3.5.3 (61E17A)`) que, según el propio texto, implementa un "overlay externo a 144 Hz", un "scanner dinámico de offsets" con resolución automática de firmas de punteros tras parches del juego, suavizado de entrada Bézier y un "panic key" (`END`) para descargar el proceso.

La model card menciona un "core externo en modo usuario" con renderizado por Desktop Duplication y sin hooks DLL internos, repartido entre 5, 4 y 8 hilos de trabajo según el módulo. No hay ninguna indicación de dataset, tokens de entrenamiento, RLHF, DPO ni innovación algorítmica verificable. La contraseña del ZIP (`2026`) y la instrucción de ejecutar como administrador son los únicos detalles operativos concretos.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- El multilingüismo declarado en los metadatos (14 idiomas) no tiene respaldo técnico en la documentación.
- Funcionalidad declarada por el autor (no verificada y ajena a un modelo de IA): overlay 2D/3D con cajas delimitadoras, esqueletos de huesos y ESP de distancia; suavizado de apuntado con radio de FOV configurable y VisCheck; perfiles JSON intercambiables en caliente; descarga instantánea del proceso.
- Estas funciones corresponden a un *cheat* para un videojuego multijugador, no a capacidades de modelo.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. Los escenarios que la model card describe son:

- Automatización de trampas en *Royale High* (Roblox) mediante overlay externo: el binario se acopla al proceso del juego y dibuja información de posición y distancia de otros jugadores.
- Asistencia de puntería automatizada: el suavizado Bézier con radio de FOV y VisCheck apunta a objetivos, lo que constituye una ventaja competitiva no permitida por los términos de servicio de Roblox.
- Evasión de detección anti-cheat: el "panic key" y la ausencia de hooks internos buscan reducir la huella del proceso frente a sistemas anti-trampas.
- Actualización tras parches del juego: el "scanner dinámico de offsets" intenta resolver firmas de punteros para mantener la funcionalidad tras actualizaciones.
- Distribución de binarios con contraseña: el ZIP protegido con `2026` dificulta el análisis automático por parte de antivirus y escáneres de malware.
- Ingeniería social y suplantación de marca: la página imita el formato de una release de GitHub con insignias de descargas y valoraciones no verificables.

Ninguno de estos casos es recomendable ni defendible en un entorno de producción o de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las cifras que aparecen en la model card ("99 % Verified", "910K+ Downloads", "99.4 % consistency") son elementos de marketing sin metodología, sin conjunto de evaluación y sin trazabilidad; no deben interpretarse como métricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos del artefacto declarados por el autor: Windows de 64 bits (Windows 11 mencionado en las etiquetas), procesadores Intel o AMD x64, 8,9 MB de espacio en disco para el ZIP y ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las menciones a "144 Hz" y "cero picos de frame-time" son afirmaciones del autor sin medición reproducible.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" para este artefacto dentro del ecosistema de Hugging Face. A modo de contraste con entradas legítimas de la plataforma:

| Criterio | `EarendelArc/royale-high-script` | Modelo de IA típico en HF |
|---|---|---|
| Contenido del repo | ZIP con `.exe` para Windows | Pesos en safetensors/GGUF + tokenizador + config |
| Pipeline declarado | no disponible | text-generation, image-text-to-text, etc. |
| Reproducibilidad | nula (binario cerrado, contraseña en el README) | verificable mediante inferencia |
| Evaluación | insignias sin metodología | benchmarks publicados (MMLU, HumanEval, GSM8K) |
| Licencia | MIT declarada sobre un binario | MIT, Apache-2.0, Llama, etc., sobre pesos |
| Riesgo de seguridad | alto (ejecutable con instrucciones para desactivar SmartScreen) | bajo si se siguen prácticas estándar |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con métricas de lenguaje, código o razonamiento.
- Riesgo de malware: un ejecutable distribuido en ZIP con contraseña y con instrucciones explícitas para ignorar las alertas de Windows Defender y SmartScreen es un vector clásico de troyanos, *stealers* e *infostealers*.
- Suplantación de cadena de suministro: el repositorio de Hugging Face (`EarendelArc`) y el de descarga (`Brittany840`) no coinciden, y los enlaces apuntan a una release de GitHub ajena al autor declarado.
- Uso prohibido por términos de servicio: la funcionalidad descrita (overlay, aim assist, ESP) viola las condiciones de Roblox y puede conllevar el baneo de la cuenta del usuario.
- La licencia MIT declarada en los metadatos no aporta ninguna garantía sobre el binario ni sobre su procedencia; no hay código fuente publicado que permita auditarlo.
- Los idiomas declarados (14) y las insignias de descargas y valoración no son verificables y parecen orientados a posicionamiento en búsquedas.
- Cualquier integración en producción, pipeline de CI/CD o entorno corporativo debe rechazarse de forma categórica.
- Recomendación operativa: excluir este repositorio de índices de modelos, no ejecutar el binario en máquinas con credenciales y reportar la entrada a la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EarendelArc/royale-high-script
- Release de descarga referenciada en la model card (no verificar ni ejecutar): https://github.com/Brittany840/royale-high-script/releases/latest
- Paquete ZIP referenciado (no descargar): https://github.com/Brittany840/royale-high-script/releases/latest/download/royale-high-script-v1.2.0-win64.zip
- Términos de servicio de Roblox (referencia sobre uso de cheats): https://en.help.roblox.com/hc/en-us/articles/115004647846-Roblox-Terms-of-Use
- No se han encontrado papers, blogs técnicos, demos ni repositorios de código fuente asociados a este artefacto.
