# ccrbenny07/murderers-vs-sheriffs-script

## Resumen

El repositorio `ccrbenny07/murderers-vs-sheriffs-script` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows (etiquetado como `portable`, `x64`, `windows-11`) que la model card presenta como un "script" para el juego Murderers Vs Sheriffs, con módulos que describen funciones de tipo cheat: radar 2D, filtrado de loot, suavizado de entrada, escáner de offsets y una capa de renderizado "stream-proof" orientada a evadir capturas de OBS, ShadowPlay y Discord. No hay pesos, tokenizador, configuración de arquitectura ni pipeline declarado.

La ficha se redacta, por tanto, sobre un artefacto que no es un modelo lingüístico: no existen parámetros, contexto, cuantizaciones ni capacidades de generación. Los campos técnicos habituales se marcan como "no disponible" porque no aplican o no están documentados, y se advierte de los riesgos de seguridad asociados a la distribución (archivo ZIP con contraseña, ejecutable que se solicita lanzar como administrador y enlaces de descarga alojados en repositorios de GitHub de terceros).

Es relevante ahora únicamente como caso de estudio de contaminación de Hugging Face con artefactos ajenos al ecosistema de IA, y como ejemplo de model card que imita el formato de fichas de modelos (badges, tablas, JSON) para dar apariencia de legitimidad a un binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no verificable como capacidad del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el paquete distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un ejecutable `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe` (build `v3.1.6`, `8009E7C271`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. Los "módulos" enumerados (núcleo externo en modo usuario, suavizado de entrada Bézier, tecla de pánico `END`, radar 2D y filtro de loot, escáner dinámico de offsets a 301 Hz, capa de renderizado excluida de capturas) son descripciones funcionales de una herramienta de trampas para un juego, no componentes de un modelo.

No se especifican datos de entrenamiento, tokens, composición de dataset, RLHF/DPO ni innovaciones de inferencia. La nomenclatura del archivo (`dlss4-unlocked`, `lossless-scaling`) parece imitar nombres de tecnologías de reescalado gráfico (DLSS de NVIDIA, Lossless Scaling) sin relación con el contenido declarado, lo que constituye una señal de engaño.

## Capacidades

- No es un modelo de lenguaje: no genera texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- Las capacidades multilingües listadas en los metadatos no están respaldadas por ninguna funcionalidad descrita.
- Las únicas funciones descritas son de manipulación de un juego en Windows: radar 2D, filtro de loot por rareza, suavizado de apuntado con radio de FOV configurable, escáner de offsets tras parches y ocultación frente a capturas de pantalla.
- No hay modo "thinking", visión, audio ni ninguna capacidad de IA.

## Casos de uso

No procede: el artefacto no es un modelo y no tiene aplicaciones legítimas de inferencia. Los escenarios que la model card sugiere (uso de módulos de trampas en un juego) quedan fuera del ámbito de esta ficha y, además, pueden contravenir los términos de servicio del juego y la legislación aplicable.

- No aplicable: generación de texto o código.
- No aplicable: atención al cliente o asistentes conversacionales.
- No aplicable: procesamiento de documentos o RAG.
- No aplicable: automatización de pipelines de CI/CD.
- No aplicable: análisis de datos o evaluación de modelos.
- No aplicable: despliegue en servidores de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (97,3 % de consistencia, < 22 ms de respuesta, 301 Hz de sondeo, < 34 MB y < 21 MB de RAM) son afirmaciones del autor sin metodología ni verificación, y no corresponden a métricas de modelos de IA.

## Requisitos de hardware

- VRAM estimada: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11, x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" para este artefacto; los paquetes ejecutables para Windows no se comparan con LLM en parámetros, contexto ni licencia de pesos.

| Criterio | murderers-vs-sheriffs-script | Modelo de IA equivalente |
|---|---|---|
| Parámetros | no disponible | no aplica |
| Contexto | no disponible | no aplica |
| Benchmarks | no disponible | no aplica |
| Licencia | MIT | no aplica |
| Formato | ZIP con `.exe` | safetensors/GGUF en modelos reales |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- El paquete se distribuye como ZIP con contraseña (`2026`) y un ejecutable que se pide lanzar "como administrador"; esto impide el análisis previo y eleva el riesgo de ejecución de código malicioso.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`Hiroshis198/...`, `sharp44667/...`) distintos del propietario del repo en Hugging Face, lo que dificulta la trazabilidad y la verificación de integridad.
- La nomenclatura imita tecnologías de reescalado gráfico (DLSS, Lossless Scaling) y el formato de una model card de IA, lo que constituye una señal de engaño o de spam.
- El contenido describe funciones de trampa en un juego, con posible incumplimiento de términos de servicio y de normativa sobre software malicioso según la jurisdicción.
- La licencia MIT declarada se refiere al repositorio, no a los binarios de terceros enlazados, cuya licencia y procedencia no están documentadas.
- Riesgo de alucinación, sesgos y limitaciones de contexto: no aplica, al no existir modelo lingüístico.
- No apto para producción en ningún pipeline de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ccrbenny07/murderers-vs-sheriffs-script
- Enlace de descarga citado en la model card (ZIP): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Repositorio de releases citado: https://github.com/sharp44667/murderers-vs-sheriffs-script/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
