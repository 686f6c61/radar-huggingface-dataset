# frsrcom/bursar-9b

## Resumen

Bursar-9b es un modelo de lenguaje especializado en agentes de pago, desarrollado por el usuario frsrcom y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B, orientado a la ejecución segura de pagos mediante el protocolo x402 sobre la red Solana. Su propuesta central es integrar en los propios pesos del modelo un "circuito compilado": una computadora RISC-V embebida en las capas de la red neuronal que el modelo invoca mediante tool calling para calcular con exactitud importes, direcciones, cuentas de token y comisiones antes de firmar cualquier transacción.

El problema que aborda es concreto: los agentes autónomos que pagan por servicios necesitan verificar cifras exactas, y los modelos de lenguaje tienden a aproximar o alucinar números y direcciones. Bursar resuelve esto delegando los cálculos críticos en el circuito compilado dentro de sus pesos, de modo que la verificación no puede ser sustituida ni envenenada en tiempo de ejecución. El modelo nunca accede a la clave privada; la firma se realiza con una clave almacenada en el llavero de macOS, y existen límites duros por pago (0,05 USDC) y por sesión (1 USDC).

El modelo se distribuye en formato MLX para ejecución local en Apple Silicon, con un tamaño de repositorio de 0,2 GB (lo que sugiere pesos cuantizados). La información pública disponible es limitada en cuanto a especificaciones técnicas formales, pero la model card documenta un pago real en mainnet de Solana y tres escenarios de ataque bloqueados correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3.5-9B) con circuito RISC-V compilado en los pesos |
| Parametros totales | 9B (heredados del modelo base, no confirmado de forma explícita en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo ocupa 0,2 GB, compatible con cuantización agresiva en MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (librería mlx) |

## Arquitectura y entrenamiento

Bursar-9b parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parámetros, y se distribuye como fine-tuning. La innovación técnica principal no reside en la arquitectura del transformer sino en la incorporación de un circuito compilado: una computadora RISC-V embebida en las capas del modelo que este invoca mediante tool calling (herramientas como `sol ui`, `sol fee`, `sol ata` y `sol x402 check`). El modelo ejecuta estas llamadas localmente, en el propio dispositivo, y devuelve resultados exactos que el CLI de Bursar utiliza para decidir entre APPROVE y STOP.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. La información disponible se centra en el comportamiento del sistema en producción: los cálculos en pesos se ejecutan en tiempos de entre 2 y 5 segundos por operación (hasta unos 55 segundos para el cálculo de cuentas de token asociadas), medidos en un MacBook. El firmware de verificación de transacciones se ejecuta actualmente en un emulador de referencia, ya que una transacción completa excede la longitud de una única llamada al modelo; el soporte para pasar la transacción como fichero se anuncia como característica futura del runtime.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B.
- Tool calling orientado a operaciones financieras: `sol ui` (conversión de unidades atómicas a importes legibles), `sol fee` (cálculo de comisiones), `sol ata` (derivación de cuentas de token asociadas) y `sol x402 check` (verificación de transacciones x402).
- Ejecución de un circuito RISC-V compilado dentro de los pesos del modelo, con resultados deterministas y verificables.
- Decisión binaria APPROVE/STOP basada en reglas: beneficiario conocido, importe dentro de límites, comisión calculada.
- Verificación de integridad de transacciones: comprueba que existe exactamente un `TransferChecked` con el mint e importe correctos hacia la cuenta de token del beneficiario.
- Resistencia a ataques de servidor hostil documentados: precio multiplicado por 1000, beneficiario sustituido tras la primera petición y cambio de un carácter en la dirección.
- Integración con el protocolo x402 sobre Solana mainnet y con el llavero de macOS para la firma (el modelo nunca ve la clave).
- Capacidades multilingües: no disponible.

## Casos de uso

- Pago automatizado de servicios x402 en Solana: un agente solicita un recurso, recibe un 402 Payment Required, y Bursar verifica importe, beneficiario y comisión con el circuito compilado antes de firmar. Es adecuado porque los cálculos exactos se ejecutan en los pesos y no dependen de la precisión del modelo generativo.
- Defensa frente a servidores maliciosos: en entornos donde el servidor que responde al 402 puede estar comprometido, Bursar bloquea importes inflados, beneficiarios sustituidos y direcciones manipuladas, lo que lo hace apto para agentes que operan contra servicios de terceros no confiables.
- Gestión de una cartera de prepago con límites duros: el modelo aplica límites de 0,05 USDC por pago y 1 USDC por sesión, lo que permite desplegarlo en agentes con presupuesto acotado y sin supervisión humana constante.
- Verificación de transacciones antes de firma: el firmware comprueba la estructura de la transacción no firmada (mint, importe, destinatario), útil en pipelines donde la firma se delega en un componente separado del razonamiento.
- Automatización de pagos por API de datos: servicios como citable.run que cobran por consulta pueden integrarse en flujos de investigación o monitorización donde el agente paga de forma autónoma por cada llamada.
- Derivación y caché de cuentas de token: el modelo calcula la cuenta de token asociada a un beneficiario una sola vez (unos 55 segundos) y la reutiliza, lo que simplifica el alta de nuevos destinatarios en el flujo `bursar add`.
- Entornos de desarrollo y auditoría de agentes financieros: la trazabilidad de cada tool call con su etiqueta (`live (model, Mac)`, `firmware check (emulator)`, `replayed`) facilita la depuración y la auditoría de decisiones de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta mediciones operativas en un MacBook: cálculos en pesos de entre 2 y 5 segundos por operación (token accounts alrededor de 55 segundos) y una verificación de firmware en emulador de 794 ms. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 0,2 GB, lo que indica pesos cuantizados en formato MLX; un modelo de 9B en cuantización de 4 bits requiere típicamente entre 5 y 6 GB de memoria unificada.
- GPU recomendadas: la model card documenta ejecución en un MacBook con Apple Silicon mediante MLX. No se mencionan GPU NVIDIA.
- Compatibilidad con GPU de consumo: previsiblemente sí en Apple Silicon con memoria unificada suficiente (no confirmado en la información disponible).
- Opciones de despliegue: MLX (librería declarada en el repo) y servidor local en `localhost:8000` según el flujo descrito en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: cálculos individuales en pesos de 2 a 5 segundos; derivación de cuenta de token de aproximadamente 55 segundos; verificación de firmware en emulador de 794 ms. No se proporcionan cifras de throughput de generación de tokens.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (agentes de pago con circuitos compilados en los pesos). El único modelo relacionado mencionado en la búsqueda web es frsrcom/Bursar-9b-v0.2, una variante del mismo autor orientada a pagos sobre Stellar, que no constituye una alternativa independiente.

## Limitaciones y advertencias

- La verificación de transacciones completas se ejecuta actualmente en un emulador de firmware, no en los pesos del modelo; el soporte para pasar transacciones como fichero se anuncia como característica futura, lo que limita el uso en producción plena.
- La derivación de cuentas de token tarda alrededor de 55 segundos, lo que puede ser inaceptable en flujos interactivos.
- El modelo está diseñado específicamente para Solana y el protocolo x402; no es un modelo de propósito general y su rendimiento fuera de ese dominio no está documentado.
- No se especifican datos sobre sesgos, composición del dataset de entrenamiento ni evaluación de alucinación en tareas generales.
- Los límites duros (0,05 USDC por pago, 1 USDC por sesión) están codificados en las reglas del CLI, no necesariamente en los pesos, y deben revisarse antes de modificar el flujo.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la seguridad de las claves y la configuración del llavero recae en el operador.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ofrece métricas de evaluación independientes.
- El repositorio es de 0,2 GB, lo que sugiere cuantización; la precisión de los pesos originales no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frsrcom/bursar-9b
- Variante v0.2 (Stellar): https://huggingface.co/frsrcom/Bursar-9b-v0.2
- Transacción real en Solana mainnet: https://explorer.solana.com/tx/2MSFP4BiqvhsxmwJUE9S2iqB8k2sZFAV7fK7rPCDKnxbPeSwfkFFQPp7QYuTHDtbiUNuBmT4aXtecxaMuQ3hiCGo
- Transcripción completa del pago: `docs/runs/pay-citable.txt` (referenciada en la model card, sin URL directa disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
