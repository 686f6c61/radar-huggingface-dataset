# DHEIVER/jepa-sigreg-ulb

## Resumen

Mangaba JEPA Fraude (ULB) es un conjunto de pesos preentrenados y ajustados para deteccion de fraude en transacciones con tarjeta de credito, publicado por DHEIVER bajo el marco de trabajo de Mangaba AI. El modelo aplica un encoder tipo transformer sobre ventanas de 32 transacciones consecutivas del dataset ULB (Credit Card Fraud Detection), combinando un preentrenamiento auto-supervisado con arquitectura JEPA (Joint Embedding Predictive Architecture) y una cabeza supervisada de clasificacion binaria para la etiqueta de fraude.

La relevancia tecnica del artefacto reside en la comparacion controlada entre dos regularizadores anti-colapso para el espacio latente: VICReg (varianza y covarianza) y SIGReg (LeJEPA, que verifica que las proyecciones del embedding sigan una gaussiana estandar). Ambos se entrenan con el mismo pipeline, lo que permite aislar el efecto del regularizador. El encoder es un transformer pre-norm de 4 capas, dimension 128 y 4 cabezas de atencion, con un predictor de 2 capas.

El modelo es un artefacto de investigacion con limitaciones explicitas: una sola semilla por variante, evaluacion sobre validacion con solo 68 positivos, y un dataset que carece de identificador de cliente (las ventanas mezclan origenes). No esta pensado como sistema de produccion, sino como evidencia preliminar sobre el comportamiento de SIGReg frente a VICReg en datos tabulares y de series temporales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-norm (encoder JEPA) + predictor de 2 capas + cabeza de clasificacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 transacciones consecutivas (ventana) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`, sin versiones GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo tabular/series temporales, sin componente de lenguaje natural) |
| Licencia | other (licencia personalizada del autor; consultar terminos en HuggingFace) |
| Formato de pesos | PyTorch (`encoder.pt`, `fraud_best.pt`) con `state_dict`, `cfg` y `meta` |

## Arquitectura y entrenamiento

El encoder es un transformer pre-norm de 4 capas con dimension 128 y 4 cabezas de atencion, acompanado de un predictor de 2 capas propio del esquema JEPA. El preentrenamiento es auto-supervisado sobre ventanas de 32 transacciones consecutivas del dataset ULB, con mascara del 40%, 2000 pasos, learning rate 3e-4 y EMA inicial de 0,996. Cada ventana se etiqueta como positiva si contiene al menos una transaccion fraudulenta. Se entrenan dos variantes que difieren unicamente en el regularizador anti-colapso: VICReg (peso de varianza 1,0 y covarianza 0,04) y SIGReg de LeJEPA (peso 0,05, 256 proyecciones, contrastando la distribucion del embedding contra una gaussiana estandar).

El ajuste fino supervisado se realiza durante 5 epocas con learning rate 1e-4 en el encoder y 1e-3 en la cabeza, usando entropia cruzada binaria con peso de clase para compensar el desbalanceo del dataset. La evaluacion se hace sobre el split de validacion (`--eval_split val`) y se selecciona la ultima epoca en ambas variantes. El codigo de entrenamiento es privado segun el autor; solo se publican los pesos y la configuracion (`cfg`, `meta`).

## Capacidades

- Deteccion binaria de fraude sobre ventanas de 32 transacciones tabulares consecutivas.
- Representacion latente auto-supervisada reutilizable (encoder JEPA) para tareas auxiliares sobre el mismo dominio.
- Clasificacion con umbral ajustable segun la tasa de falsos positivos objetivo (se reporta recall@1%FPR).
- Aprendizaje de dependencias temporales locales dentro de la ventana de 32 transacciones.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generacion de texto, codigo, matematicas ni vision.
- No es multilingue: opera sobre features tabulares, no sobre lenguaje natural.
- No dispone de modo thinking ni capacidades de agente.

## Casos de uso

- Investigacion comparativa de regularizadores anti-colapso: el par VICReg/SIGReg con pipeline identico permite aislar el efecto del regularizador sobre AP y AUC en datos tabulares desbalanceados, como base para replicar el experimento con mas semillas.
- Prototipado de scoring de fraude en tarjetas: el checkpoint `fraud_best.pt` puede cargarse para obtener una probabilidad de fraude por ventana de 32 transacciones, util como linea base antes de invertir en un sistema propio.
- Extraccion de embeddings para clustering o deteccion de anomalias: el `encoder.pt` puede reutilizarse como extractor de features auto-supervisado y combinarse con clasificadores alternativos (Isolation Forest, One-Class SVM) sobre el mismo dataset.
- Estudio de ventanas temporales en datos tabulares: la configuracion de 32 transacciones con mascara del 40% sirve como plantilla para experimentar con otras longitudes de ventana y tasas de enmascaramiento en series financieras.
- Docencia y divulgacion sobre JEPA en dominios no visuales: el artefacto es un ejemplo compacto (4 capas, dim 128) de como aplicar el paradigma JEPA fuera de vision y lenguaje, con codigo de carga minimo.
- Evaluacion de robustez ante desbalanceo extremo: con BCE ponderada por clase y metricas como recall@1%FPR, el modelo es un banco de pruebas para tecnicas de manejo de clases minoritarias en fraude.
- No se recomienda su uso directo en produccion de scoring de fraude sin reentrenamiento sobre datos con identificador de cliente y validacion temporal fuera de muestra.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de validacion, epoca 5, una semilla por variante:

| Regularizador | AP | AUC | recall@1%FPR |
|---|---|---|---|
| VICReg | 0,801 | 0,913 | 0,779 |
| SIGReg (LeJEPA) | 0,806 | 0,913 | 0,779 |

La diferencia de AP entre variantes es de 0,005, inferior al umbral de fiabilidad que el propio autor estima (aproximadamente 0,01 de AP dado que la validacion contiene solo 68 positivos). No se han publicado resultados de benchmarks en la informacion disponible mas alla de esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del encoder (4 capas, dim 128, 4 cabezas) el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; para reentrenamiento se recomienda una GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090, A100, H100) por comodidad, aunque el modelo probablemente entrene en menos.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: al ser pesos PyTorch (`state_dict`), el despliegue se hace cargando el modulo con `torch.load` y reconstruyendo la red con `cfg["dim"]`, `cfg["layers"]` y `cfg["heads"]`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, la latencia por ventana de 32 transacciones deberia ser del orden de milisegundos en GPU y decenas de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparativa natural es entre las dos variantes del propio artefacto (VICReg frente a SIGReg), ya cubierta en la seccion de benchmarks. Frente a enfoques clasicos de deteccion de fraude (regresion logistica, XGBoost, Isolation Forest) no se han publicado comparaciones en la informacion disponible.

| Modelo | Parametros | Contexto | AP | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mangaba JEPA Fraude VICReg | no disponible | 32 transacciones | 0,801 | 0,913 | other | HuggingFace |
| Mangaba JEPA Fraude SIGReg | no disponible | 32 transacciones | 0,806 | 0,913 | other | HuggingFace |
| Alternativas (XGBoost, Isolation Forest, etc.) | no disponible | no aplica | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Una sola semilla por variante: no hay intervalo de confianza ni significacion estadistica; la diferencia de AP (0,005) no permite afirmar superioridad de un regularizador sobre el otro.
- Evaluacion sobre validacion con solo 68 positivos: diferencias por debajo de aproximadamente 0,01 de AP no son fiables, y los numeros son optimistas al haberse seleccionado la ultima epoca en ambas variantes.
- El dataset ULB no incluye identificador de cliente: las ventanas mezclan origenes distintos, por lo que el modelo no representa el escenario de produccion con secuencias por cliente.
- No probado con datos reales de clientes; cualquier uso en produccion requiere reentrenamiento y validacion temporal fuera de muestra.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, agravado por el desbalanceo extremo del dominio.
- Sesgos conocidos: no documentados por el autor; el dataset ULB tiene sesgo de origen (transacciones europeas de 2013) y posible deriva temporal.
- Restricciones de licencia: la licencia es "other"; es imprescindible revisar los terminos exactos en la model card y respetar la licencia original del dataset `David-Egea/Creditcard-fraud-detection`, que no se redistribuye.
- El codigo de entrenamiento es privado, lo que limita la reproducibilidad completa del experimento.
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DHEIVER/jepa-sigreg-ulb
- Dataset utilizado: https://huggingface.co/datasets/David-Egea/Creditcard-fraud-detection
- Perfil del autor: https://huggingface.co/DHEIVER
- Paper de LeJEPA / SIGReg: no disponible en la informacion proporcionada
- Repositorio de codigo de entrenamiento: no disponible (privado segun el autor)
- Blog o demo: no disponible
