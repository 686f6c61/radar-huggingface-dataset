# frager598/hyperliquid-vault-copytrading-perp-bot

## Resumen

El artefacto publicado bajo el identificador `frager598/hyperliquid-vault-copytrading-perp-bot` no es un modelo de inteligencia artificial, sino un paquete ejecutable para Windows distribuido a través de Hugging Face. Su model card describe un bot de copytrading y trading de perpetuos sobre Hyperliquid, empaquetado como archivo ZIP de 8,9 MB con un ejecutable `.exe` para Windows 10 y 11 de 64 bits. No contiene pesos, tokenizador, configuración de arquitectura ni ningún componente propio de un modelo de lenguaje.

El contenido de la model card presenta características propias de software de trading (ejecución multi-cartera, enrutamiento de órdenes por debajo de 40 ms, bóveda local de claves AES-256, motor de bundles Jito/MEV) junto con instrucciones de descarga que incluyen una contraseña de descompresión y la ejecución del binario como administrador. Esos patrones de distribución no corresponden a un modelo open source y deben tratarse con cautela desde el punto de vista de seguridad.

Por tanto, esta ficha documenta el artefacto tal como aparece en la información disponible, señalando explícitamente los campos que no aplican o no están disponibles. No se han publicado benchmarks, especificaciones de arquitectura neuronal ni datos de entrenamiento, porque el objeto publicado no es un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; se describe como ejecutable de trading para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni binarios de pesos) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura de red neuronal, dataset de entrenamiento, número de tokens, fases de RLHF o DPO, ni innovaciones de inferencia como decodificación especulativa o atención lineal. La model card describe únicamente módulos funcionales de un programa de trading: sandbox de paper trading, espejo de carteras de ballenas, bundler de 20 carteras mediante lookup tables, enrutamiento de órdenes por WebSocket y gRPC, bóveda local de claves AES-256 y motor de bundles Jito/MEV con tip sizing dinámico. Estos elementos son funcionalidades de software, no componentes de un transformer ni de un modelo híbrido.

## Capacidades

- No se trata de un modelo generativo: no hay generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte documentado de tool calling ni de function calling en el sentido de una API de modelo.
- No hay soporte de agentes basado en razonamiento multi-paso de un LLM; la model card menciona ejecución multi-cartera y copytrading automatizado como lógica de aplicación.
- Multilingüismo: los metadatos listan 14 idiomas, pero no se especifica si se refieren a la interfaz, a la documentación o a otro elemento del paquete.
- Capacidades especiales declaradas: paper trading en vivo, copytrading de smart money, bundler de 20 carteras, enrutamiento de órdenes de baja latencia, bóveda local de claves y motor de bundles Jito/MEV.

## Casos de uso

- Simulación de estrategias sin riesgo: el paquete declara un sandbox de paper trading contra libros de órdenes en vivo, útil para validar una estrategia antes de operar con capital real.
- Réplica de carteras de ballenas: el módulo de copytrading permitiría replicar posiciones de carteras seleccionadas con dimensionamiento proporcional, según la descripción del autor.
- Ejecución multi-cartera coordinada: el bundler de 20 carteras con lookup tables se orienta a operaciones en el mismo bloque sobre varias cuentas.
- Enrutamiento de órdenes de baja latencia: el streaming por WebSocket y gRPC se plantea para escenarios donde la latencia de envío es crítica.
- Gestión local de claves: la bóveda AES-256 local busca evitar la exposición de claves privadas a servicios remotos.
- Optimización de inclusión en bloque: el motor de bundles Jito/MEV con tip sizing dinámico se orienta a mejorar la probabilidad de inclusión atómica de transacciones.

Ninguno de estos casos se ha verificado de forma independiente a partir de la información disponible; se derivan de la descripción del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas cifras de rendimiento que aparecen en la model card son declaraciones del autor sobre el software (consistencia del 96,1 % y 97,3 % en dos módulos, enrutamiento por debajo de 40 ms, uso de menos de 51 MB de RAM, respuesta en menos de 26 ms y sondeo a 414 Hz). No son benchmarks de modelos de lenguaje y no se han contrastado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, al no ser un modelo neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), 64 bits.
- Tamaño del artefacto: ZIP de 8,9 MB con contraseña de descompresión `2026`.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI); el autor indica ejecutar el `.exe` como administrador.
- Latencia y throughput: el autor declara enrutamiento por debajo de 40 ms y sondeo a 414 Hz, sin verificación independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyperliquid-vault-copytrading-perp-bot | no disponible (no es un modelo) | no disponible | no disponible | MIT | Hugging Face, 0 descargas, 0 likes |
| Modelos de lenguaje open source comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No existe una categoría de modelos comparable: el artefacto es un ejecutable de trading, no un modelo de IA. Cualquier comparación con LLM, modelos MoE o SSM carecería de base técnica.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA; etiquetarlo o evaluarlo como tal es un error de categorización.
- Distribución mediante ZIP protegido con contraseña y ejecución como administrador: patrón habitual en campañas de malware, no verificable a partir de la información disponible.
- Enlaces de descarga apuntan a un repositorio de GitHub (`egorov3123/hyperliquid-vault-copytrading-perp-bot`) distinto del identificador de Hugging Face (`frager598/...`), lo que impide confirmar la cadena de custodia del binario.
- Software de trading con acceso a claves privadas y capital real: riesgo financiero directo y de custodia si la bóveda local no está auditada.
- Cifras de rendimiento (96,1 %, 97,3 %, sub-40 ms, 414 Hz) sin metodología ni verificación independiente.
- Licencia MIT declarada, pero la licencia no cubre la seguridad del binario ni garantiza ausencia de código malicioso.
- Sin descargas ni likes en Hugging Face en la fecha de creación (2026-11-24), lo que impide cualquier validación por parte de la comunidad.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no aplican a un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/frager598/hyperliquid-vault-copytrading-perp-bot
- Repositorio GitHub citado en la model card: https://github.com/egorov3123/hyperliquid-vault-copytrading-perp-bot
- Releases del repositorio citado: https://github.com/egorov3123/hyperliquid-vault-copytrading-perp-bot/releases/latest
- Paper, blog, demo: no disponible
