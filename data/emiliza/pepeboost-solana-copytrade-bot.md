# emiliza/pepeboost-solana-copytrade-bot

## Resumen

`emiliza/pepeboost-solana-copytrade-bot` es un repositorio alojado en Hugging Face que, a pesar de su identificador y de las etiquetas propias de la plataforma, no contiene un modelo de lenguaje ni pesos de ningún tipo. El contenido publicado es una model card que distribuye un supuesto ejecutable para Windows (`pepeboost-solana-copytrade-bot-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB y protegido con la contraseña `2026`) presentado como un bot de copytrading para la red Solana. No se declara arquitectura, número de parámetros, longitud de contexto ni formato de pesos.

El artefacto se describe como una herramienta de escritorio para Windows 10/11 de 64 bits que replicaría carteras de "smart money" en Solana, con módulos de firma local AES-256, filtro de honeypots, bundling de hasta 20 carteras mediante Lookup Tables, enrutado de órdenes en menos de 40 ms y motor de bundles Jito/MEV. Toda esta descripción procede exclusivamente de la model card del autor y no está respaldada por documentación técnica verificable, código fuente ni resultados de evaluación.

Desde la perspectiva de evaluación de modelos de IA, este repositorio no es utilizable como modelo: no hay pipeline declarado, cero descargas y cero "likes" en el momento de la consulta. La ficha se redacta para dejar constancia técnica de qué hay realmente publicado y de los riesgos asociados a su distribución, no para recomendar su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se distribuye un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio no contiene pesos en safetensors, GGUF ni ningún otro formato de modelo; el único artefacto descrito es un binario `pepeboost-solana-copytrade-bot-v1.2.0-win64.exe` empaquetado en `pepeboost-solana-copytrade-bot-v1.2.0-win64.zip` (8,9 MB), con build declarada `v1.6.1 (694BDE)`.

La model card enumera módulos funcionales del ejecutable (bóveda de claves AES-256 local, filtro pre-compra de honeypots, bundler de 20 carteras con Lookup Tables, copytrading de ballenas, enrutado de órdenes por WebSocket y gRPC, motor de bundles Jito/MEV) y menciona reparto de trabajo entre 6, 11 y 14 hilos y un consumo declarado inferior a 29 MB de RAM. No se aporta código fuente, repositorio de GitHub verificable, hash de integridad del binario ni proceso de compilación reproducible, por lo que ninguna de estas afirmaciones es auditable.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni function calling en el sentido de modelos de lenguaje.
- No se declara soporte de agentes ni razonamiento multi-paso.
- La model card atribuye al ejecutable capacidades de trading: firma local de transacciones, filtrado de honeypots, bundling multi-cartera, copytrading de ballenas y envío de bundles Jito/MEV.
- Los idiomas listados en los metadatos (14 códigos ISO) corresponden a etiquetas de la model card, no a capacidades lingüísticas de un modelo.

## Casos de uso

- Auditoría de seguridad de artefactos en Hugging Face: el repositorio sirve como caso de estudio de model cards que distribuyen binarios ejecutables en lugar de pesos, útil para equipos que definen políticas de ingesta en pipelines de MLOps.
- Formación en detección de ingeniería social: el patrón de ZIP con contraseña, insignias de descargas infladas y enlaces a un repositorio de GitHub de terceros es un ejemplo didáctico de cadena de distribución sospechosa.
- Investigación sobre contaminación de hubs de modelos: permite documentar cómo las etiquetas de Hugging Face (idiomas, licencia MIT, región US) pueden aplicarse a contenido que no es un modelo.
- Evaluación de riesgos en entornos corporativos: bloqueo y clasificación de descargas que no son safetensors/GGUF en proxies y filtros de red.
- Análisis forense de malware: si se dispone de una copia aislada en sandbox, el binario puede analizarse estáticamente para identificar firma, empaquetado y comportamiento de red.
- No se identifica ningún caso de uso legítimo como modelo de IA, ya que no lo es.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras operativas autoinformadas (enrutado por debajo de 40 ms, menos de 29 MB de RAM, 6/11/14 hilos de trabajo) que no constituyen benchmarks de modelo ni son verificables con la información publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Plataforma declarada del ejecutable: Windows 10/11 de 64 bits (x64).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles; las cifras de la model card no son auditables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a otros artefactos del hub, la comparación relevante sería con repositorios que distribuyen binarios en lugar de pesos, categoría para la que no se han identificado referencias verificables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, arquitectura ni pipeline declarado; las etiquetas de idioma y la licencia MIT no implican capacidades de modelo.
- Distribución de un ejecutable de procedencia no verificada: la model card enlaza a un repositorio de GitHub de un tercero (`MarekNilsson/pepeboost-solana-copytrade-bot`) distinto del autor en Hugging Face (`emiliza`), sin código fuente ni compilación reproducible.
- Indicadores de riesgo claros: ZIP protegido con contraseña (`2026`), instrucción de ejecutar como administrador, insignias de descargas (918K+) no verificables y cero descargas reales en Hugging Face.
- Riesgo de seguridad: ejecutar binarios de este tipo como administrador puede comprometer el sistema; la mención a "bóveda de claves AES-256 local" implica manejo de claves privadas de cartera, un objetivo de alto valor para atacantes.
- Riesgo financiero: cualquier herramienta de copytrading conlleva pérdida de capital; no hay evidencia de funcionamiento ni auditoría.
- Licencia MIT declarada en los metadatos, pero sin archivo LICENSE verificable en la información disponible; la licencia no cubre la seguridad del binario.
- Sesgos y alucinación: no aplicable al no ser un modelo generativo; el equivalente es la información autoinformada y no verificable de la model card.
- Recomendación operativa: no descargar ni ejecutar; si se requiere análisis, hacerlo en máquina virtual aislada y sin acceso a carteras reales.

## Enlaces

- Hugging Face: https://huggingface.co/emiliza/pepeboost-solana-copytrade-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/MarekNilsson/pepeboost-solana-copytrade-bot
- Releases referenciadas: https://github.com/MarekNilsson/pepeboost-solana-copytrade-bot/releases/latest
- Paper, blog o demo oficial: no disponible
