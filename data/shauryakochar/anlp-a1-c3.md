# shauryakochar/anlp-a1-c3

## Resumen

El modelo `shauryakochar/anlp-a1-c3` es un transformer encoder-decoder construido íntegramente con operaciones básicas de PyTorch, sin utilizar módulos de alto nivel como `nn.Transformer`, `nn.MultiheadAttention` o `nn.LayerNorm`. Ha sido desarrollado por Shaurya Kochar como parte de una tarea académica de la asignatura Advanced Natural Language Processing (ANLP) en IIIT Hyderabad. Su propósito es mapear secuencias binarias cifradas a texto plano, un problema de secuencia a secuencia con una configuración específica de atención por grupos (Grouped-Query Attention, GQA).

Con 6,58 millones de parámetros, este modelo no es un LLM generalista, sino un experimento de investigación centrado en el estudio de arquitecturas de atención y su impacto en tareas de descifrado. Su relevancia radica en que documenta una implementación limpia y reproducible de un transformer desde cero, con métricas de evaluación detalladas y código fuente disponible. Aunque no está pensado para uso productivo, sirve como referencia didáctica y base para experimentos de ablación en arquitecturas de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con Grouped-Query Attention (configuracion C3) |
| Parametros totales | 6.583.296 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (trabaja con secuencias binarias de longitud fija, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el modelo opera sobre secuencias binarias, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (archivo `.pt`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder transformer convencional, pero implementada desde cero con operaciones básicas de PyTorch. La configuracion C3 emplea Grouped-Query Attention (GQA), una variante de atencion que reduce el numero de cabezas de clave y valor en comparacion con las cabezas de consulta, mejorando la eficiencia computacional sin degradar significativamente la calidad. No se utilizan capas de normalizacion predefinidas (`nn.LayerNorm`), lo que obliga a implementar la normalizacion manualmente.

No se dispone de informacion detallada sobre el dataset de entrenamiento (numero de tokens, composicion, etc.) ni sobre el proceso de optimizacion (funcion de perdida, optimizador, hiperparametros). Los unicos datos disponibles son el tiempo total de entrenamiento (3288,38 segundos, unos 54,8 minutos) y el tiempo por epoca (46,98 segundos). El modelo se evalua con decodificacion greedy y alcanza una precision de secuencia del 90,76% en el conjunto de prueba.

## Capacidades

- Mapeo de secuencias binarias cifradas a texto plano, tarea principal del modelo.
- Razonamiento secuencia a secuencia con atencion por grupos, demostrando la viabilidad de GQA en un transformer construido desde cero.
- Precision a nivel de bit del 99,17% y a nivel de caracter del 97,92% en el conjunto de prueba.
- Capacidad de generar secuencias completas con una precision del 90,76% (medida como exactitud de secuencia).
- No soporta tool calling, agentes, ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de vision; su dominio se limita a secuencias binarias.

## Casos de uso

- Investigacion academica en arquitecturas de atencion: el modelo sirve como base para estudiar el impacto de GQA frente a atencion multi-cabeza estandar, permitiendo comparar metricas de precision y eficiencia.
- Experimentos de ablacion: al estar construido sin modulos de alto nivel, es facil modificar componentes (atencion, normalizacion) y medir su efecto en tareas de secuencia a secuencia.
- Ensenanza de transformers: el codigo fuente, disponible en GitHub, es un recurso didactico para entender los mecanismos internos de un transformer sin depender de abstracciones de bibliotecas.
- Tareas de descifrado de secuencias binarias: aunque limitado a un dominio especifico, puede adaptarse a problemas similares de traduccion de codigos binarios a texto.
- Pruebas de eficiencia de memoria: con un pico de memoria de 1317 MB, es util para evaluar el consumo de recursos de arquitecturas GQA en entornos con restricciones.
- Reproducibilidad de resultados: al publicar pesos, configuracion y metricas, permite replicar el experimento y verificar la implementacion.

## Benchmarks y rendimiento

Los resultados de evaluacion en el conjunto de prueba, obtenidos con decodificacion greedy, son los siguientes:

| Metrica | Valor |
|---|---|
| Precision de bit | 0,9917 |
| Precision de caracter | 0,9792 |
| Precision de secuencia | 0,9076 |
| Distancia de Levenshtein | 0,1578 |
| Distancia de Levenshtein normalizada | 0,0026 |
| BLEU | 0,9794 |
| ROUGE-L | 0,9889 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el pico de memoria durante la evaluacion fue de 1317 MB, por lo que cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente para inferencia y entrenamiento.
- Al ser un modelo pequeno (6,5 M de parametros), no requiere hardware especializado como A100 o H100.
- Opciones de despliegue: al ser un modelo de investigacion, se usa directamente con PyTorch. No se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, pero dado el tamano del modelo, la inferencia es practicamente instantanea en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (transformers encoder-decoder para secuencias binarias con GQA). Existen otros repositorios con nombres similares (`neemon/anlp-a1-c3`, `siddarthg44/anlp-a1-2023102040-C3`), pero no se han publicado sus metricas ni configuraciones, por lo que no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de investigacion academica, no apto para produccion ni para tareas generales de lenguaje.
- Entrenado exclusivamente para mapear secuencias binarias cifradas a texto plano; no generaliza a otros dominios o formatos de entrada.
- No se especifican los datos de entrenamiento ni el proceso de generacion de las secuencias cifradas, lo que limita la reproducibilidad externa.
- La longitud de contexto no esta documentada; el modelo podria fallar con secuencias mas largas que las vistas durante el entrenamiento.
- No se han realizado evaluaciones de sesgos ni de robustez ante entradas adversariales.
- La licencia MIT permite uso comercial, pero el modelo no ofrece garantias de rendimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shauryakochar/anlp-a1-c3
- Codigo fuente: https://github.com/shaurya-kochar/anlp-assignment1
- Registro de entrenamiento (WandB): https://wandb.ai/shaurya-kochar-iiit-hyderabad/anlp-a1-transformer-ablation
