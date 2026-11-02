# mangaba-ai/jepa-sigreg-ulb

## Resumen

Mangaba JEPA Fraude (ULB) es un modelo de deteccion de fraude en tarjetas de credito desarrollado por Mangaba AI. No es un modelo de lenguaje: es un encoder tabular y de series temporales entrenado con el paradigma JEPA (Joint Embedding Predictive Architecture) sobre ventanas de 32 transacciones consecutivas del dataset ULB, al que se anade una cabeza de clasificacion supervisada para la tarea de fraude. El repositorio publica dos variantes que comparten pipeline y difieren unicamente en el regularizador anti-colapso: VICReg (varianza y covarianza) y SIGReg, la propuesta de LeJEPA que verifica que las proyecciones del embedding sigan una gaussiana estandar.

El modelo resuelve un problema clasico de deteccion de anomalias en datos tabulares altamente desbalanceados, empleando pre-entrenamiento auto-supervisado con enmascaramiento del 40 por ciento antes del ajuste fino supervisado. La relevancia actual reside en el interes creciente por aplicar arquitecturas predictivas auto-supervisadas (JEPA) a dominios no linguisticos, y en la comparacion controlada entre dos estrategias anti-colapso sobre un mismo dataset de referencia.

El encoder es un transformer pre-norm de 4 capas, dimension 128 y 4 cabezas, con un predictor de 2 capas. El pre-entrenamiento se realizo durante 2000 pasos con learning rate 3e-4 y EMA inicial de 0,996. El ajuste fino supervisado duro 5 epocas con BCE ponderada por clase. El repositorio tiene un tamano de 0,0 GB y no incluye el codigo de entrenamiento, que el autor declara privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-norm (encoder JEPA) + predictor de 2 capas + cabeza de clasificacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 32 transacciones consecutivas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo tabular y de series temporales) |
| Licencia | other (ver model card y licencia del dataset original) |
| Formato de pesos | PyTorch (`.pt`), no safetensors ni GGUF |

Configuracion adicional declarada por el autor:

| Item | Valor |
|---|---|
| Capas del encoder | 4 |
| Dimension del encoder | 128 |
| Cabezas de atencion | 4 |
| Capas del predictor | 2 |
| Pre-entrenamiento | 2000 pasos, lr 3e-4, mascara 40%, EMA inicial 0,996 |
| Anti-colapso VICReg | varianza 1,0, covarianza 0,04 |
| Anti-colapso SIGReg | peso 0,05, 256 proyecciones |
| Ajuste fino | 5 epocas, lr 1e-4 encoder, 1e-3 cabeza, BCE con peso de clase |
| Ficheros | `encoder.pt` (ctx, cfg, meta), `fraud_best.pt` (net, cfg, meta) |

## Arquitectura y entrenamiento

El modelo sigue el esquema JEPA: un encoder transformador procesa ventanas de 32 transacciones consecutivas con un 40 por ciento de enmascaramiento y un predictor de 2 capas intenta predecir las representaciones de las partes enmascaradas en el espacio latente, no en el espacio de entrada. Para evitar el colapso de representaciones se emplean dos regularizadores alternativos. La variante VICReg impone terminos de varianza (1,0) y covarianza (0,04) sobre las dimensiones del embedding. La variante SIGReg, tomada de LeJEPA, comprueba mediante 256 proyecciones aleatorias que la distribucion del embedding se aproxime a una gaussiana estandar, con un peso de 0,05 en la funcion de perdida.

El pre-entrenamiento consta de 2000 pasos con learning rate 3e-4 y un coeficiente EMA inicial de 0,996, tipico de los esquemas tipo teacher-student. Posteriormente se anade una cabeza de clasificacion de fraude y se ajusta de forma supervisada durante 5 epocas, con learning rate 1e-4 para el encoder y 1e-3 para la cabeza, usando entropia cruzada binaria ponderada por clase para compensar el fuerte desbalanceo del dataset ULB. El autor no publica el numero total de tokens ni la composicion exacta del dataset, mas alla de referenciar `David-Egea/Creditcard-fraud-detection`. El codigo de entrenamiento no se distribuye.

## Capacidades

- Deteccion binaria de fraude en ventanas de 32 transacciones consecutivas del dataset ULB.
- Representacion auto-supervisada de secuencias tabulares de transacciones mediante encoder JEPA reutilizable.
- Extraccion de embeddings latentes (`encoder.pt`) para tareas posteriores de clasificacion o analisis.
- Clasificacion con cabeza supervisada ya ajustada (`fraud_best.pt`) lista para inferencia.
- Comparacion controlada de dos regularizadores anti-colapso (VICReg frente a SIGReg) sobre el mismo pipeline.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Investigacion sobre JEPA en datos tabulares: el par de checkpoints permite reproducir la comparacion VICReg frente a SIGReg en un dataset publico y evaluar el efecto del regularizador anti-colapso con un pipeline identico.
- Prototipado de sistemas de deteccion de fraude en tarjetas: el checkpoint `fraud_best.pt` ofrece una linea base supervisada con AP de 0,801 a 0,806 en validacion, util para comparar contra modelos propios antes de invertir en infraestructura.
- Extraccion de caracteristicas para modelos posteriores: el encoder pre-entrenado puede congelarse y usarse como extractor de embeddings de ventanas de transacciones para alimentar clasificadores ligeros o modelos de clustering de anomalias.
- Analisis de desbalanceo extremo: el ajuste fino con BCE ponderada por clase sirve como referencia metodologica para tratar datasets con muy pocos positivos (68 en validacion).
- Evaluacion de metricas apropiadas en fraude: el modelo reporta AP, AUC y recall a 1 por ciento de FPR, lo que permite estudiar por que AUC no discrimina entre variantes mientras AP si lo hace marginalmente.
- Docencia y formacion: ejemplo compacto (4 capas, dimension 128) de auto-supervision con enmascaramiento y regularizacion anti-colapso, ejecutable en CPU para inspeccion de pesos.
- Benchmark interno de deteccion de anomalias: punto de comparacion reproducible frente a autoencoders, isolation forests o modelos supervisados clasicos sobre el mismo dataset ULB.

## Benchmarks y rendimiento

Resultados declarados por el autor en validacion, epoca 5, una sola semilla:

| Regularizador | AP | AUC | Recall@1%FPR |
|---|---|---|---|
| VICReg | 0,801 | 0,913 | 0,779 |
| SIGReg (LeJEPA) | 0,806 | 0,913 | 0,779 |

El autor advierte que la diferencia de AP es de 0,005, que con una unica semilla no permite afirmar superioridad de un regularizador sobre el otro, y que con 68 positivos en validacion las diferencias por debajo de aproximadamente 0,01 de AP no son fiables. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4 capas, dimension 128 y ventanas de 32 transacciones, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU. No se dispone de cifra exacta de parametros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1060 en adelante, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: al ser un checkpoint PyTorch puro (`.pt`), se carga con `torch.load` y se sirve con TorchServe, FastAPI o un script propio. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Por el tamano del modelo se espera inferencia en milisegundos o menos por ventana en GPU moderna, pero el autor no publica mediciones.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos alternativos en la informacion disponible. Como referencia cualitativa, la literatura de deteccion de fraude en el dataset ULB suele emplear autoencoders, isolation forests, XGBoost o redes LSTM, pero no se dispone de resultados numericos comparables en esta ficha. La unica comparacion interna es entre las dos variantes del propio modelo (VICReg y SIGReg), cuyos resultados figuran en la seccion de benchmarks.

## Limitaciones y advertencias

- Una sola semilla por variante, sin intervalos de confianza; las diferencias de AP por debajo de 0,01 no son fiables.
- El ajuste fino se evaluo sobre el conjunto de validacion (`--eval_split val`) y se eligio la ultima epoca, por lo que los numeros publicados son optimistas y no reflejan rendimiento en test ciego.
- La validacion contiene solo 68 positivos, lo que limita la potencia estadistica de cualquier conclusion.
- El dataset ULB no incluye identificador de cliente: las ventanas mezclan transacciones de origenes distintos, por lo que el modelo no representa el escenario de produccion con secuencias por cliente.
- No ha sido probado con datos reales de clientes; su traslado a produccion requiere reentrenamiento y validacion propios.
- Riesgo de alucinacion no aplica (no es generativo), pero si existe riesgo de falsos negativos y falsos positivos en un dominio sensible como el fraude financiero.
- Sesgos conocidos: no documentados por el autor; el dataset ULB tiene una distribucion temporal y geografica concreta que puede no generalizar.
- Licencia "other": es necesario revisar los terminos exactos del repositorio y respetar la licencia original del dataset `David-Egea/Creditcard-fraud-detection`, que no se redistribuye.
- El codigo de entrenamiento es privado, lo que dificulta la reproducibilidad completa.
- No es un modelo de lenguaje: no admite prompts, tool calling ni instrucciones en lenguaje natural.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mangaba-ai/jepa-sigreg-ulb
- Dataset utilizado: https://huggingface.co/datasets/David-Egea/Creditcard-fraud-detection
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo o demos adicionales.
