# deadbydawn101/RavenX-Apex-Wolf-Gemma4-31B-Dense-Wealthmaker-MLX

## Resumen

RavenX-Apex-Wolf-Gemma4-31B-Dense-Wealthmaker-MLX es un modelo de lenguaje especializado en trading cuantitativo, desarrollado por RavenX AI Labs LLC (autor: deadbydawn101, Gabe Garcia). Se construye sobre el modelo base Gemma 4 31B Dense abliterated (divinetribe/gemma-4-31b-it-abliterated-4bit-mlx) y se afina con LoRA en MLX para Apple Silicon. El modelo está diseñado para actuar como un agente autónomo de trading que calcula rangos de desviación estándar a partir de la volatilidad implícita, detecta patrones de manipulación en memecoins, aplica el criterio de Kelly, gestiona circuit breakers y monitoriza contagio sistémico.

La relevancia de este modelo radica en su enfoque vertical: no es un chatbot generalista, sino un sistema orientado a la ejecución de estrategias en opciones, criptomonedas, Polymarket y arbitraje. Incorpora un método de entrenamiento patentado denominado "Soul Injection" (USPTO #64/087,357) que combina tres fases de LoRA dirigida por capas. Con 31 mil millones de parámetros activos (arquitectura densa, no MoE) y una ventana de contexto de 262.144 tokens, el modelo está optimizado para inferencia en Apple Silicon con cuantización de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 60 capas decoder, 32 cabezas de atencion, 5376 dimensiones ocultas |
| Parametros totales | 31 mil millones (31B) |
| Parametros activos | 31B (todos activos, no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Ingles (en) |
| Licencia | RavenX Proprietary (otra) |
| Formato de pesos | Safetensors (adaptadores LoRA), MLX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 31B Dense, que emplea un transformer decoder con 60 capas, 32 cabezas de atencion y dimensiones ocultas de 5376. Sobre esta base se aplica un afinamiento LoRA con r=8 y alpha=16, dirigido a los modulos q_proj, v_proj, gate_proj y down_proj en las capas 0 a 15. El entrenamiento se realiza en tres fases secuenciales: una fase de continuacion de preentrenamiento (CPT) con 1.000 pasos y 301.000 ejemplos de datos de trading e investigacion; una fase de ajuste supervisado (SFT) con 5.000 pasos y 14.700 ejemplos de identidad y voz; y una fase final "Wolf" con 3.000 pasos y 5.200 ejemplos de voz de agente cuantitativo. El metodo patentado "Soul Injection" permite congelar modulos LoRA especificos y realizar inyeccion manual de pesos entre fases, una innovacion que facilita el entrenamiento dirigido por capas en MLX.

El modelo se distribuye con cuantizacion de 4 bits, alcanzando un pico de memoria de 17,8 GB durante la inferencia. El adaptador LoRA resultante ocupa 37 MB. No se especifican detalles sobre el dataset de entrenamiento mas alla de los enlaces a tres datasets publicos en HuggingFace: RavenX-Apex-Wolf-Wealthmaker-Trading (42 ejemplos), RavenX-Trade-Research-Dataset (9.495 operaciones RAZOR) y RavenX-Soul-Injection-SFT-Data (datos SFT maestros y variantes de personalidad).

## Capacidades

- Calculo de rangos de 1 desviacion estandar (1-SD) a partir de la volatilidad implicita (IV) y colocacion de strikes de iron condor en los limites.
- Deteccion de "kill hours" (horas de alto riesgo): rechaza operaciones en periodos como 3:45-4:00 PM, primeros 15 minutos de apertura, viernes por la tarde y antes de reuniones de la FED.
- Analisis de memecoins: lectura de bundle ratios, deteccion de estrategias moonbag, identificacion de rug pulls y patrones de acumulacion Sybil.
- Calculo del criterio de Kelly con parametros especificos del usuario, incluyendo tabla de Kelly fraccional.
- Deteccion de ballenas en cadena: identificacion de clustering de wallets, wash trading y esquemas pump-and-dump.
- Gestion de riesgo con circuit breakers: detiene el trading tras perdidas maximas consecutivas y realiza un post-mortem de tres categorias antes de reiniciar a mitad de tamano.
- Monitorizacion de contagio: analisis de curvas VIX, metodologia de velas de capitulacion y deteccion de brechas de VaR con propagacion de margin calls.
- Arbitraje cash-and-carry: calculo de rendimiento por funding rate (ejemplo: 65,7% APR) y evaluacion de cuatro factores de riesgo.
- Generacion de sub-agentes sandboxed: creacion de wallets desechables, seleccion de bots y diversificacion de presupuesto para ejecucion autonoma.
- Soporte de tool calling y function calling implicito en las capacidades de agente, aunque no se documenta explicitamente una API de herramientas.

## Casos de uso

- Trading de opciones automatizado: el modelo calcula rangos 1-SD a partir de la IV y coloca iron condors en los limites, rechazando operaciones en horas de alto riesgo. Es adecuado para traders que necesitan automatizar la gestion de posiciones con opciones.
- Analisis de memecoins en Pump.fun: detecta bundle ratios, moonbag strategies y senales de rug pull antes de entrar en una posicion. Util para traders de criptomonedas de alta rotacion.
- Gestion de riesgo en Polymarket: aplica el criterio de Kelly con parametros personalizados y descompone conjeturas complejas en componentes evaluables. Adecuado para apostadores profesionales.
- Arbitraje de criptomonedas: identifica oportunidades cash-and-carry, calcula rendimientos por funding rate y evalua riesgos de contraparte. Util para fondos de cobertura cuantitativos.
- Monitorizacion de carteras y contagio: analiza curvas VIX, detecta brechas de VaR y activa modos de crisis ante propagacion de margin calls. Adecuado para gestores de riesgo institucionales.
- Agentes autonomos de trading: genera sub-agentes sandboxed con wallets desechables y presupuestos diversificados para ejecutar estrategias de forma independiente. Util para sistemas de trading de alta frecuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una tabla de evaluacion cualitativa sobre 10 dominios de trading, con resultados declarados como "10/10", pero no se proporcionan metricas cuantitativas comparables con otros modelos. Los datos de rendimiento disponibles se limitan a la velocidad de inferencia: 13,9 tokens por segundo en un M4 Max de 128 GB, ~18 t/s en M3 Ultra de 192 GB y ~30+ t/s en M5 Ultra de 512 GB.

## Requisitos de hardware

- VRAM estimada: 17,8 GB de pico de memoria con cuantizacion de 4 bits.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4/M5), cualquier Mac con 24 GB o mas de RAM unificada.
- Compatibilidad con GPU de consumo: no aplica para NVIDIA; el modelo esta optimizado exclusivamente para MLX en Apple Silicon.
- Opciones de despliegue: MLX, mlx-lm, mlx-tune. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 13,9 t/s en M4 Max 128 GB, ~18 t/s en M3 Ultra 192 GB, ~30+ t/s en M5 Ultra 512 GB, 8-14 t/s en Macs de 24 GB.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa directa con modelos de la misma categoria (agentes de trading cuantitativo). Como referencia, se puede comparar con el modelo base Gemma 4 31B Dense, del cual deriva:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| RavenX-Apex-Wolf (este) | 31B | 262.144 | RavenX Proprietary | Trading cuantitativo |
| Gemma 4 31B Dense (base) | 31B | 262.144 | Gemma (Google) | Generalista |
| Gemma 4 E4B (MoE) | ~4B activos | no disponible | Gemma (Google) | Generalista eficiente |

No se han encontrado modelos comparables de trading cuantitativo con licencia abierta en la informacion disponible.

## Limitaciones y advertencias

- Licencia propietaria (ravenx-proprietary): restringe el uso comercial y la redistribucion. No es un modelo open source a pesar de estar publicado en HuggingFace.
- Entrenado exclusivamente en ingles; no se garantiza rendimiento en otros idiomas.
- Riesgo de alucinacion en datos de mercado: el modelo puede generar analisis plausibles pero incorrectos si no recibe datos en vivo. La model card enfatiza que "demanda datos en vivo" antes de construir posiciones, pero no se documenta un mecanismo de validacion externa.
- Sesgos potenciales: el entrenamiento se basa en datos de operaciones reales (9.495 operaciones RAZOR) que pueden contener sesgos de seleccion o de mercado.
- Dependencia de la infraestructura de RavenX AI Labs: el metodo de entrenamiento "Soul Injection" esta patentado y pendiente de aprobacion, lo que puede limitar la reproducibilidad.
- No es un consejero financiero: aunque el modelo se presenta como un agente de trading, no se proporcionan garantias de rentabilidad ni de seguridad en la ejecucion de operaciones.
- Compatibilidad limitada: el modelo requiere el uso de `get_peft_model()` antes de cargar pesos; `load_adapter()` es un no-op silencioso, lo que puede causar errores en pipelines estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deadbydawn101/RavenX-Apex-Wolf-Gemma4-31B-Dense-Wealthmaker-MLX
- Perfil del autor en HuggingFace: https://huggingface.co/deadbydawn101
- GitHub del autor: https://github.com/DeadByDawn101
- Sitio web de RavenX AI Labs: https://ravenxllm.com
- Dataset de entrenamiento (Wealthmaker Trading): https://huggingface.co/datasets/deadbydawn101/RavenX-Apex-Wolf-Wealthmaker-Trading
- Dataset de investigacion (RAZOR): https://huggingface.co/datasets/deadbydawn101/RavenX-Trade-Research-Dataset
- Dataset SFT (Soul Injection): https://huggingface.co/datasets/deadbydawn101/RavenX-Soul-Injection-SFT-Data
- Modelo base: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
