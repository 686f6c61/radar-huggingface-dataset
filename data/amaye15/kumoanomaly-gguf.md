# amaye15/kumoanomaly-gguf

## Resumen

Kumo-Anomaly GGUF es una conversión al formato GGUF del modelo Kumo-Anomaly de NVIDIA, un modelo de localización de anomalías en series temporales multivariantes basado en difusión. Lo desarrolla el usuario amaye15 como parte del proyecto zsfm, un workspace en Rust que porta modelos fundacionales de forecasting zero-shot y datos tabulares a GGUF con el framework Burn, verificado bit-exact contra el checkpoint original de PyTorch. El modelo original es de NVIDIA; esta ficha describe la conversión GGUF.

El modelo resuelve un problema concreto: detectar y localizar pasos temporales anómalos en datos multivariantes sin entrenamiento específico sobre el dominio (zero-shot). Reconstruye la entrada mediante un encoder transformer de difusión y expone los residuos de reconstrucción por celda (fila y columna), de modo que valores altos señalan anomalías. Admite hasta 40 variables por paso temporal.

Su relevancia práctica radica en la posibilidad de ejecutar inferencia sin PyTorch ni runtime de Python: el GGUF embebe los metadatos de arquitectura y se ejecuta con la librería zsfm (Rust o Python). Con 2.595.329 parámetros es un modelo muy compacto, adecuado para entornos con recursos limitados o pipelines en Rust. La licencia de los pesos es OpenMDW-1.1 (uso comercial permitido) y el código de conversión es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de difusion para reconstruccion de series temporales |
| Parametros totales | 2.595.329 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32 (unico fichero publicado: `kumoanomaly-f32.gguf`) |
| Idiomas soportados | No aplica (modelo numerico de series temporales); la model card declara `en` |
| Licencia | Pesos: OpenMDW-1.1; codigo de conversion: MIT |
| Formato de pesos | GGUF (F32); pesos originales PyTorch en nvidia/Kumo-Anomaly |

## Arquitectura y entrenamiento

Kumo-Anomaly es un modelo de localización de anomalías basado en difusión. La entrada es una serie temporal multivariante normalizada, con máscara opcional de valores faltantes; un encoder transformer de difusión reconstruye la entrada y la salida son residuos de reconstrucción por celda que resaltan los pasos temporales anómalos. Soporta hasta 40 columnas (variables) por paso temporal. El número de parámetros del checkpoint convertido es de 2.595.329.

La conversión a GGUF la realiza el proyecto zsfm-rs, que porta modelos fundacionales de forecasting y tabulares a GGUF + Burn y verifica que la inferencia sea bit-exact respecto al checkpoint original de PyTorch. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Localización de anomalías zero-shot en series temporales multivariantes (detección por paso temporal y por variable).
- Reconstrucción de la serie de entrada (`recon`) y devolución del objetivo (`target`) junto con los residuos.
- Manejo opcional de valores faltantes mediante máscara (`mask`).
- Soporte de hasta 40 variables por paso temporal.
- Salida estructurada con residuo medio absoluto por celda (`residual`), recuento de features puntuadas (`score_feature_count`), máscara de features válidas (`valid_feature_mask`) y número de columnas (`ncols`).
- Inferencia sin PyTorch ni Python: ejecutable vía librería zsfm en Python (`pip install zsfm`) o Rust/CLI (`cargo install zsfm`).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni agentes; es un modelo numérico especializado.

## Casos de uso

- Monitorización de infraestructura: detectar picos o caídas anómalas en métricas de servidores (CPU, memoria, latencia) alimentando matrices de pasos temporales × variables y revisando los residuos altos por celda.
- Detección de fraude en transacciones: modelar series de importes y frecuencias por cliente y localizar pasos temporales con reconstrucción anómala sin etiquetas de fraude previas (zero-shot).
- Mantenimiento predictivo industrial: analizar lecturas de sensores multivariantes de maquinaria y localizar ventanas con comportamiento anómalo antes de una avería, gracias al soporte de hasta 40 variables por paso.
- Calidad de datos en pipelines ETL: usar los residuos de reconstrucción para señalar registros o intervalos corruptos o fuera de distribución en tablas temporales.
- Monitorización energética: detectar consumos anómalos en series de contadores por instalación y variable, con máscara para huecos de medición.
- Integración en servicios en Rust: desplegar la inferencia dentro de un binario o servicio Rust con Burn, sin dependencia de un runtime de Python, para scoring en tiempo casi real.
- Análisis exploratorio de datos científicos: localizar segmentos anómalos en experimentos con múltiples canales antes de un análisis manual más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la conversión está verificada bit-exact contra el checkpoint original de PyTorch.

## Requisitos de hardware

- VRAM estimada: con 2,6 millones de parámetros en F32, los pesos ocupan aproximadamente 10 MB; el consumo real vendrá dominado por las activaciones y el tamaño de lote, no por los pesos.
- GPU recomendadas: cualquier GPU moderna con suficiente memoria para el lote; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo; no se detallan modelos concretos.
- Opciones de despliegue: librería zsfm (Python, `pip install zsfm`) y CLI/Rust (`cargo install zsfm`, con Burn como backend). No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Kumo-Anomaly GGUF (esta ficha) | 2.595.329 | No disponible | Difusion, localizacion de anomalias zero-shot | OpenMDW-1.1 (pesos) / MIT (conversion) | GGUF F32 |
| nvidia/Kumo-Anomaly (original) | No disponible | No disponible | Difusion, localizacion de anomalias zero-shot | OpenMDW-1.1 | PyTorch |
| Otros modelos de anomalias en series temporales | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se publica un fichero en F32; no hay versiones cuantizadas (Q4, Q8, etc.) que reduzcan memoria o aceleren la inferencia.
- La longitud de contexto y la ventana temporal máxima no están documentadas; el límite conocido es de 40 variables por paso temporal.
- Modelo especializado en series temporales numéricas: no genera texto ni código, y no debe evaluarse como LLM.
- Riesgo de falsos positivos y negativos en la detección: los residuos altos son un indicio, no una certeza; conviene calibrar umbrales por dominio.
- Requiere datos normalizados como entrada; un preprocesado incorrecto degrada la reconstrucción y, por tanto, la detección.
- La model card declara idioma `en`, pero al ser un modelo numérico el concepto de idioma no aplica realmente.
- Licencia: los pesos originales son OpenMDW-1.1 (uso comercial permitido según NVIDIA) y el código de conversión es MIT; conviene revisar los términos de OpenMDW-1.1 antes de un despliegue comercial.
- Repositorio con muy poca tracción (42 descargas, 0 likes) y creado en 2026: madurez y soporte limitados.
- La corrección bit-exact se declara frente al checkpoint de PyTorch, pero no se aportan resultados de rendimiento que la respalden más allá de esa afirmación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amaye15/kumoanomaly-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Kumo-Anomaly
- Repositorio zsfm-rs (Rust): https://github.com/amaye15/zsfm-rs
- Framework Burn: https://github.com/tracel-ai/burn
