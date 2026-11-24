# Marselox/kingdom-come-deliverance-2-trainer-keyless

## Resumen

El repositorio `Marselox/kingdom-come-deliverance-2-trainer-keyless` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows x64 presentado como "trainer" (utilidad de trampas) del videojuego *Kingdom Come: Deliverance 2*. El artefacto se distribuye como un archivo ZIP de 8,9 MB con un binario `kingdom-come-deliverance-2-trainer-keyless-v1.2.0-win64.exe` (build `v4.2.4`, `38FD65`) y una contraseña de extracción fija (`2026`). No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La model card describe funcionalidades propias de una herramienta de modding o cheating: radar 2D con filtro de loot, escáner dinámico de offsets, perfiles JSON intercambiables en caliente, suavizado de entrada Bézier y una tecla de pánico (`END`) para descargar el proceso. Menciona métricas como `97,7 %` de consistencia, `< 48 MB` de RAM y `< 26 ms` de respuesta, pero no aporta metodología de medición ni enlaces verificables más allá de un repositorio de GitHub de terceros.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA: no existen parámetros, contexto, cuantizaciones ni benchmarks. Se documenta la información disponible y se advierte de los riesgos de seguridad asociados a la ejecución de binarios sin verificación, con contraseña en archivo y distribución mediante enlaces externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni información sobre datasets, tokens de entrenamiento, RLHF, DPO o técnicas de atención. La model card describe una herramienta externa en modo usuario ("user-mode external core") que, según el autor, evita hooks DLL internos y utiliza Desktop Duplication para el renderizado del radar. Estas afirmaciones no van acompañadas de código fuente, hashes de verificación ni artefactos reproducibles.

Tampoco se documenta el proceso de build, las dependencias del binario ni la cadena de custodia del ejecutable. La única referencia técnica es un nombre de build (`v4.2.4`, `38FD65F82F`) y el tamaño del ZIP (8,9 MB), datos insuficientes para auditar el comportamiento del programa.

## Capacidades

- No es un modelo de lenguaje: no genera texto, código, matemáticas ni razonamiento.
- No soporta tool calling, function calling ni agentes.
- No tiene capacidades multimodales (visión, audio) en el sentido de un modelo de IA.
- Según la model card, el ejecutable ofrece: radar 2D con filtro de loot por rareza, escáner dinámico de offsets tras parches del juego, perfiles JSON intercambiables (Legit, Visual, Custom), suavizado de entrada Bézier con FOV configurable y VisCheck, y tecla de pánico `END`.
- Los idiomas listados en los metadatos corresponden a la localización declarada de la herramienta, no a capacidades lingüísticas de un modelo.

## Casos de uso

- No procede evaluar casos de uso de IA. El artefacto, según su propia descripción, está orientado a modificar el comportamiento de *Kingdom Come: Deliverance 2* en Windows 10/11 de 64 bits.
- Uso potencial declarado por el autor: ajuste de parámetros de juego mediante perfiles JSON y teclas de acceso rápido.
- Uso potencial declarado: visualización de objetos y contenedores mediante radar 2D con filtrado por rareza.
- Uso potencial declarado: recarga de offsets tras actualizaciones del juego mediante escáner de firmas.
- Cualquier uso en producción de software, pipelines de datos o sistemas de IA queda fuera del alcance del artefacto.
- Advertencia: la ejecución de binarios de procedencia no verificada, distribuidos con contraseña fija y enlaces a repositorios de terceros, conlleva riesgos de seguridad que deben evaluarse antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las cifras citadas en la model card (`97,7 %` de consistencia, `< 48 MB` de RAM, `< 26 ms` de respuesta, `9` hilos de trabajo) carecen de metodología, entorno de prueba y reproducibilidad, por lo que no se recogen como resultados verificables.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (según la model card).
- RAM declarada por el autor: menos de 48 MB para el escáner de offsets.
- Almacenamiento: el ZIP ocupa 8,9 MB; el tamaño del ejecutable extraído no se especifica.
- GPU: no aplica (no es un modelo de IA); el radar usa Desktop Duplication, que requiere una GPU compatible con la API de captura de Windows.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se han identificado en la información proporcionada otras herramientas de la misma categoría con datos verificables para establecer una comparación técnica.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; etiquetarlo o tratarlo como tal es un error de categoría.
- La licencia MIT declarada en los metadatos no exime de responsabilidades sobre el contenido del binario; el código fuente no está incluido.
- Distribución mediante enlace a un repositorio de GitHub de terceros (`vkuznetsov5922/...`) no vinculado al autor del repositorio de Hugging Face.
- Archivo ZIP protegido con contraseña fija (`2026`), práctica que dificulta el análisis automático por parte de antivirus y sistemas de inspección.
- Instrucción de ejecutar el binario "como administrador", lo que amplía la superficie de riesgo del sistema.
- Cifras de rendimiento sin metodología ni reproducibilidad.
- Posible incumplimiento de los términos de servicio del videojuego y de las políticas de la plataforma; riesgo de baneo o de acciones legales según jurisdicción.
- Riesgo de malware: no se aportan hashes, firmas ni auditorías del ejecutable.
- Sin soporte técnico, issues ni canal de reporte de vulnerabilidades documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/kingdom-come-deliverance-2-trainer-keyless
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/vkuznetsov5922/kingdom-come-deliverance-2-trainer-keyless
- Descarga directa citada en la model card (no verificada): https://github.com/vkuznetsov5922/kingdom-come-deliverance-2-trainer-keyless/releases/latest/download/kingdom-come-deliverance-2-trainer-keyless-v1.2.0-win64.zip
- Paper, blog o demo oficial: no disponible.
