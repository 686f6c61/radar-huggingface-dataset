# Don-Don/mars-order-10m

## Resumen

MarS Order 10M es un modelo de generación de órdenes de mercado diseñado específicamente para el motor de simulación financiera MarS, desarrollado por Microsoft y publicado en arXiv (2409.07486). Este modelo, subido por el usuario Don-Don, aprende patrones históricos de órdenes para generar secuencias realistas de órdenes de compra y venta, lo que permite simular la microestructura de un mercado financiero sin necesidad de datos en tiempo real.

El modelo tiene una arquitectura transformer (probablemente basada en Llama 2, según la etiqueta del repositorio) con aproximadamente 10 millones de parámetros, un tamaño muy reducido que lo hace ejecutable incluso en hardware modesto. Acepta secuencias de 1024 pasos con 15 características por paso y devuelve logits para 49152 posibles tokens de órdenes. Su relevancia radica en que proporciona una base generativa para la simulación de mercados, un área con aplicaciones en investigación financiera, backtesting y análisis de liquidez.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (probablemente tipo Llama 2, según etiqueta) |
| Parametros totales | 10.065.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 (según forma del tensor de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo especializado en datos numéricos de mercado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal, alineada con la familia Llama 2 según la etiqueta del repositorio. Está diseñado para procesar secuencias de órdenes de mercado codificadas como tensores de forma `(batch, 1024, 15)`, donde cada paso contiene 15 características numéricas que representan atributos de la orden (precio, volumen, dirección, etc.). La salida son logits de forma `(batch, 1024, 49152)`, que corresponden a la distribución de probabilidad sobre el vocabulario de tokens de órdenes definido por el tokenizador de MarS.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La innovación principal no reside en la arquitectura en sí, sino en su integración con el motor MarS: el modelo se carga mediante la clase `OrderModel` y se utiliza dentro del flujo de simulación para generar órdenes sintéticas que alimentan el libro de órdenes simulado.

## Capacidades

- Generación de órdenes de mercado: produce logits para el siguiente token de orden en una secuencia, permitiendo generar libros de órdenes sintéticos.
- Procesamiento de secuencias largas: maneja contextos de hasta 1024 pasos, suficiente para simular sesiones de trading de alta frecuencia.
- Integración con MarS: funciona como componente central del motor de simulación, reemplazando o complementando modelos basados en reglas.
- Especialización en datos numéricos: no procesa lenguaje natural, solo tensores numéricos de características de mercado.
- Sin capacidades de tool calling, agentes, visión o audio: es un modelo puramente generativo de secuencias numéricas.

## Casos de uso

- Simulación de microestructura de mercado: el modelo genera órdenes realistas que permiten estudiar la dinámica del libro de órdenes, el spread y la profundidad sin depender de datos históricos completos.
- Backtesting de estrategias de trading: al generar flujos de órdenes sintéticos, se pueden probar algoritmos de ejecución en escenarios variados y controlados.
- Investigación en finanzas computacionales: sirve como base para experimentos sobre formación de precios, liquidez y comportamiento de agentes en mercados simulados.
- Generación de datos sintéticos para entrenamiento: las secuencias de órdenes generadas pueden usarse para entrenar otros modelos de predicción o clasificación sin violar restricciones de datos propietarios.
- Análisis de escenarios extremos: modificando las características de entrada, se pueden simular condiciones de mercado anómalas (picos de volatilidad, shocks de liquidez) para evaluar la robustez de sistemas.
- Educación y demostraciones: permite a estudiantes e investigadores visualizar cómo funciona un mercado financiero mediante simulación interactiva con MarS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de lenguaje general. Tampoco se han reportado métricas específicas de calidad de generación de órdenes (por ejemplo, realismo estadístico o cointegración con datos reales).

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (10 millones de parámetros), por lo que cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) es suficiente; también puede ejecutarse en CPU con PyTorch.
- Compatibilidad con consumer GPU: sí, es un modelo extremadamente ligero.
- Opciones de despliegue: se carga mediante la clase `OrderModel` del repositorio MarS, que usa PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible, pero dado el tamaño, la inferencia debería ser casi instantánea en GPU y muy rápida en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (generación de órdenes de mercado). El ecosistema de modelos de simulación financiera basados en transformers es incipiente y no hay alternativas públicas conocidas con características similares. Se puede mencionar que el propio MarS incluye otros componentes (como un modelo de mapa de mercado) pero no son directamente comparables.

## Limitaciones y advertencias

- No es consejo financiero: la model card indica explícitamente que no debe usarse como base única para decisiones de trading o inversión.
- Modelo pequeño: con solo 10 millones de parámetros, la calidad de las órdenes generadas puede ser limitada en comparación con modelos más grandes, aunque no hay benchmarks que lo confirmen.
- Especialización estrecha: no procesa lenguaje natural ni tiene capacidades generales; solo genera secuencias numéricas de órdenes.
- Dependencia de MarS: requiere el ecosistema MarS (tokenizador, preprocesamiento, assets) para funcionar; no es un modelo autónomo.
- Datos de entrenamiento desconocidos: no se ha publicado información sobre el conjunto de datos, lo que dificulta evaluar posibles sesgos o limitaciones en la cobertura de mercados.
- Licencia MIT: permite uso comercial, pero el uso responsable queda bajo la responsabilidad del usuario, especialmente en contextos financieros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Don-Don/mars-order-10m
- Repositorio de assets: https://huggingface.co/datasets/Don-Don/mars-order-assets
- Repositorio GitHub de MarS: https://github.com/microsoft/MarS
- Paper de MarS (arXiv): https://arxiv.org/abs/2409.07486
- Documentación técnica de OrderModel (DeepWiki): https://deepwiki.com/microsoft/MarS/3-ordermodel-and-ml-components
- Arquitectura de OrderModel (DeepWiki): https://deepwiki.com/microsoft/MarS/3.1-ordermodel-architecture
