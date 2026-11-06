# Ambarella/YOLOP

## Resumen

YOLOP (You Only Look Once for Panoptic Driving Perception) es una red neuronal multi-tarea disenada para percepcion de conduccion panoptica. A partir de una unica imagen de entrada, el modelo realiza simultaneamente tres tareas: deteccion de vehiculos, segmentacion del area transitable y segmentacion de lineas de carril. Fue propuesto originalmente en el articulo publicado en Springer (Machine Intelligence Research, 2022) y su implementacion de referencia esta disponible en el repositorio hustvl/YOLOP.

El checkpoint publicado en Hugging Face bajo el identificador Ambarella/YOLOP es una version del modelo original entrenada de extremo a extremo sobre el conjunto de datos BDD100K. Ambarella lo distribuye empaquetado para su despliegue en hardware de borde de la propia compania (SoCs de las familias N1, X7, CV7, CV72 y CV75), con artefactos binarios optimizados para el SDK Cooper, lo que lo orienta a inferencia en dispositivos embebidos con requisitos estrictos de latencia y consumo energetico.

La relevancia de esta ficha radica en su caracter multi-tarea con un unico codificador compartido: en lugar de desplegar tres modelos independientes, un solo pase de red resuelve deteccion y segmentacion, algo especialmente valioso en plataformas automotrices con presupuesto computacional limitado. La informacion disponible sobre parametros, contexto, licencia y benchmarks es escasa, por lo que varios campos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional multi-tarea con codificador compartido y tres decodificadores especificos de tarea (deteccion, segmentacion de area transitable, segmentacion de carril) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuyen artefactos "Amba_optimized" y "Activation_fp16" para SoCs Ambarella |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth de referencia); binarios propietarios para SoCs Ambarella (.bin) |

## Arquitectura y entrenamiento

YOLOP sigue un diseno de una sola etapa con un codificador convolucional compartido que alimenta tres cabezas o decodificadores independientes: una para deteccion de vehiculos, otra para segmentacion del area transitable y otra para segmentacion de lineas de carril. Esta estructura permite que las tres tareas se beneficien de representaciones compartidas y que la inferencia se realice en un unico pase hacia delante, lo que reduce el coste computacional frente a soluciones que encadenan modelos separados.

El checkpoint alojado en Hugging Face corresponde a un entrenamiento de extremo a extremo sobre BDD100K, con resolucion de entrada de 3x384x640. La model card no detalla el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino adicionales como RLHF o DPO (no aplicables a este tipo de modelo). Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio diseno multi-tarea con codificador compartido. La version de Ambarella anade artefactos compilados y optimizados para su SDK Cooper (2.5.4) y Cooper Foundry (2.3), orientados a la aceleracion en NPU de sus SoCs.

## Capacidades

- Deteccion de vehiculos en imagenes de escenas de conduccion.
- Segmentacion del area transitable (drivable area) a nivel de pixel.
- Segmentacion de lineas de carril (lane line segmentation).
- Percepcion panoptica multi-tarea en un unico pase de inferencia.
- Inferencia en tiempo real en hardware de borde (SoCs Ambarella N1-655, X7, CV7, CV72, CV75).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo de razonamiento (thinking mode), vision generativa ni audio.

## Casos de uso

- Asistencia a la conduccion (ADAS) en vehiculos de produccion: el modelo proporciona de forma conjunta deteccion de vehiculos, area transitable y carriles, lo que permite a un sistema ADAS basico tomar decisiones de mantenimiento de carril y alerta de colision frontal con una sola pasada de red.
- Sistemas de aviso de salida de carril (LDW): la cabeza de segmentacion de carriles permite estimar la posicion del vehiculo respecto a las lineas y generar avisos cuando se detecta un cruce no intencionado.
- Deteccion de obstaculos en camaras frontales de bajo coste: la cabeza de deteccion de vehiculos permite identificar coches en la via para funciones de frenado de emergencia o control de crucero adaptativo en plataformas con recursos limitados.
- Percepcion en drones y robots moviles: la segmentacion del area transitable es reutilizable en navegacion de robots terrestres o vehiculos autonomos de interior que necesitan distinguir zonas seguras de obstaculos.
- Analitica de trafico y video-vigilancia: procesamiento en el borde de grabaciones de trafico para extraer carriles, areas transitables y vehiculos sin enviar video a la nube, gracias a los binarios optimizados para SoCs Ambarella.
- Prototipado e investigacion en percepcion multi-tarea: el checkpoint de referencia en PyTorch y el codigo del repositorio hustvl/YOLOP permiten reproducir resultados, hacer fine-tuning sobre otros datasets de conduccion y comparar arquitecturas multi-tarea.
- Despliegue en camaras IP inteligentes con SoC Ambarella: los artefactos compilados para Cooper SDK permiten integrar el modelo directamente en el pipeline de la camara para deteccion y segmentacion en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un modelo convolucional con entrada 3x384x640, la huella de memoria es reducida en comparacion con modelos de lenguaje, pero no se especifica el valor exacto.
- GPU recomendadas: no disponible; el modelo esta pensado principalmente para NPU de SoCs Ambarella (N1-655, X7, CV7, CV72, CV75).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el checkpoint PyTorch de referencia puede ejecutarse en GPU convencionales, pero no se documentan requisitos minimos.
- Opciones de despliegue: SDK Cooper 2.5.4 y Cooper Foundry 2.3 para SoCs Ambarella; PyTorch para el checkpoint de referencia. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tareas | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOP (Ambarella) | Deteccion + area transitable + carriles | no disponible | Imagen 3x384x640 | no disponible | Hugging Face + binarios SoC Ambarella |
| Multinet (repositorio hustvl) | Deteccion + segmentacion de area + carriles | no disponible | Imagen | no disponible | GitHub hustvl |
| HybridNets | Deteccion + area transitable + carriles + profundidad | no disponible | Imagen | no disponible | GitHub datvuthanh |

La comparativa se limita a alternativas multi-tarea de percepcion de conduccion; no se dispone de datos de rendimiento numericos para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card no especifica la licencia, por lo que no puede confirmarse el uso comercial sin consultar al autor.
- No se documentan sesgos conocidos, pero al entrenarse sobre BDD100K el modelo puede heredar los sesgos de ese dataset (condiciones climaticas, geografia, iluminacion).
- Riesgo de alucinacion no aplicable en el sentido linguistico; sin embargo, puede producir falsos positivos o falsos negativos en deteccion y segmentacion en condiciones adversas (lluvia, noche, deslumbramiento).
- Limitaciones de idioma no aplicables (modelo de vision sin capacidades linguisticas).
- El modelo esta optimizado y empaquetado para SoCs Ambarella; los binarios .bin no son portables a otro hardware.
- La resolucion de entrada fija (3x384x640) limita la adaptacion a otras relaciones de aspecto sin reentrenamiento o redimensionado.
- No se documentan metricas de rendimiento ni condiciones de entrenamiento, lo que dificulta evaluar su robustez en produccion.
- El tamano del repositorio es de 0.0 GB segun la informacion de Hugging Face, lo que sugiere que los pesos pueden no estar completamente alojados o que la medicion es incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/Ambarella/YOLOP
- Paper original: https://link.springer.com/article/10.1007/s11633-022-1339-y
- Repositorio de referencia: https://github.com/hustvl/YOLOP
- Pesos originales: https://github.com/hustvl/YOLOP/blob/main/weights/End-to-end.pth
- Binario N1-655 Amba_optimized: https://huggingface.co/Ambarella/YOLOP/blob/main/n1-655_yolop_amba_optimized.bin
- Binario N1-655 Activation_fp16: https://huggingface.co/Ambarella/YOLOP/blob/main/n1-655_yolop_act16.bin
- Binario X7 Amba_optimized: https://huggingface.co/Ambarella/YOLOP/blob/main/x7_yolop_amba_optimized.bin
- Binario X7 Activation_fp16: https://huggingface.co/Ambarella/YOLOP/blob/main/x7_yolop_act16.bin
- Binario CV7 Amba_optimized: https://huggingface.co/Ambarella/YOLOP/blob/main/cv7_yolop_amba_optimized.bin
- Binario CV7 Activation_fp16: https://huggingface.co/Ambarella/YOLOP/blob/main/cv7_yolop_act16.bin
- Binario CV72 Amba_optimized: https://huggingface.co/Ambarella/YOLOP/blob/main/cv72_yolop_amba_optimized.bin
- Binario CV72 Activation_fp16: https://huggingface.co/Ambarella/YOLOP/blob/main/cv72_yolop_act16.bin
- Binario CV75 Amba_optimized: https://huggingface.co/Ambarella/YOLOP/blob/main/cv75_yolop_amba_optimized.bin
- Binario CV75 Activation_fp16: https://huggingface.co/Ambarella/YOLOP/blob/main/cv75_yolop_act16.bin
