# abhirajratna/anlp-a2-optim-muon

## Resumen

El modelo `abhirajratna/anlp-a2-optim-muon` es un transformer decoder-only denso de 33.563.136 parametros, desarrollado por el usuario abhirajratna como parte de la asignacion ANLP A2 (Parte 2) del curso Advanced NLP del IIIT Hyderabad (Monsoon 2026). Su proposito no es ser un modelo de produccion, sino servir de artefacto experimental para comparar el rendimiento de distintos optimizadores durante el preentrenamiento. En concreto, este checkpoint fue entrenado con una implementacion desde cero del optimizador Muon (subclasificando unicamente `torch.optim.Optimizer`), en lugar de optimizadores convencionales como AdamW o Lion.

El modelo sigue la arquitectura densa descrita como "variante v1" de la Parte 1 de la asignatura: 8 capas, dimension de modelo (d_model) de 512, 8 cabezas de atencion y un MLP de 2 capas con dimension intermedia de 2048. Se preentreno para prediccion de siguiente token (next-token prediction) en una sola pasada sobre el split de entrenamiento del dataset `browndw/human-ai-parallel-corpus`, consumiendo 39.038.976 tokens. La longitud de contexto, el vocabulario y la composicion exacta del dataset no se detallan en la model card.

Su relevancia es fundamentalmente academica y de investigacion: permite estudiar el comportamiento del optimizador Muon (basado en ortogonalizacion de actualizaciones mediante iteraciones de Newton-Schulz) frente a alternativas como Lion en modelos pequenos y controlados. Con 33,6 millones de parametros y un test BLEU de 4.59, no es un modelo apto para tareas generativas reales, sino una pieza de un banco de pruebas comparativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 33.563.136 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

Detalles arquitectonicos adicionales declarados por el autor: 8 capas, d_model 512, 8 cabezas de atencion, MLP de 2 capas con dimension 2048.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso y de tamano reducido, correspondiente a la "variante v1" descrita en la Parte 1 de la asignatura: 8 capas, d_model de 512, 8 cabezas de atencion y un perceptron multicapa de 2 capas con dimension intermedia de 2048. No se emplean tecnicas de atencion dispersa, MoE, SSM ni arquitecturas hibridas; es un transformer convencional orientado a un preentrenamiento ligero.

El entrenamiento consiste en una unica pasada (one pass) sobre el split de entrenamiento del dataset `browndw/human-ai-parallel-corpus` (un corpus paralelo humano-IA en ingles), con un total de 39.038.976 tokens procesados (el dataset contiene 39.047.168 tokens en su split de entrenamiento). El pico de learning rate fue de 0.02. La innovacion tecnica central es el uso de una implementacion desde cero del optimizador Muon, que subclasifica unicamente `torch.optim.Optimizer`. Muon aplica ortogonalizacion a las actualizaciones de momento mediante iteraciones de Newton-Schulz (los coeficientes habituales son 3.4445, -4.775, 2.0315 con 5 pasos). No se documenta el uso de RLHF, DPO ni tecnicas de alineacion posteriores al preentrenamiento. Tampoco se especifican detalles sobre el tokenizador, la composicion exacta del dataset ni la estrategia de decodificacion en evaluacion (mas alla de continuaciones de 64 tokens).

## Capacidades

- Generacion de texto: el modelo es capaz de producir continuaciones de texto en ingles tras un preentrenamiento de prediccion de siguiente token.
- Modelado de lenguaje base: puede usarse para calcular probabilidades de secuencias y para evaluar perplejidad (loss de validacion final: 3.5710).
- Continuacion de texto corta: la evaluacion se realizo con continuaciones de 64 tokens, lo que sugiere que el modelo funciona mejor en tramos breves.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay indicios de entrenamiento para ello.
- Capacidades multilingues: limitadas al ingles (`en`).
- Capacidades especiales (modo thinking, vision, audio): ninguna documentada.
- Fine-tuning: al ser un checkpoint de PyTorch en safetensors con codigo de carga provisto, puede servir como base para experimentos de ajuste, aunque su tamano lo limita a tareas muy acotadas.

## Casos de uso

- Investigacion comparativa de optimizadores: el uso principal es reproducir y comparar el efecto del optimizador Muon frente a Lion y AdamW en el mismo setup (mismo modelo v1, mismo dataset y misma pasada de entrenamiento). El checkpoint `abhirajratna/anlp-a2-optim-lion` y `siddarthg44/anlp-a2-p2-muon` sirven como contrapartes directas.
- Estudios de estabilidad de entrenamiento a pequena escala: por su tamano, permite repetir experimentos completos de preentrenamiento en pocos minutos u horas en una unica GPU o incluso en CPU, aislando el efecto del optimizador.
- Ensayos de curricula de datos: con 39 millones de tokens y una sola pasada, es un banco de pruebas adecuado para medir como afecta el orden o la composicion del corpus `human-ai-parallel-corpus` al loss y al BLEU.
- Prototipado de pipelines de evaluacion (BLEU, loss de validacion): util para validar infraestructura de evaluacion antes de escalar a modelos mayores.
- Analisis de la curva de aprendizaje de Muon: permite inspeccionar la convergencia y la estabilidad de las actualizaciones ortogonalizadas en un decoder pequeno.
- Docencia y materiales de curso: puede emplearse como ejemplo reproducible en asignaturas de NLP avanzado para ilustrar el ciclo completo de preentrenamiento, desde el dataset hasta la metrica final.
- Experimentos de fine-tuning de bajo coste: entrenar clasificadores o tareas auxiliares sobre representaciones de un modelo de 33,6M es viable en hardware muy modesto.

Nota: ninguno de estos casos corresponde a un uso productivo o comercial realista; el modelo no alcanza calidad de generacion utilizable (test BLEU de 4.59 sobre continuaciones de 64 tokens con 7 referencias).

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los siguientes:

| Metrica | Valor |
|---|---|
| Tokens de entrenamiento | 39.038.976 |
| Peak learning rate | 0.02 |
| Loss de validacion final | 3.5710 |
| Test BLEU (continuaciones de 64 tokens, 7 referencias) | 4.59 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es coherente con el caracter academico del modelo y su tamano reducido.

## Requisitos de hardware

- VRAM estimada para inferencia (33,56M de parametros):
  - FP32: aproximadamente 134 MB de pesos.
  - FP16 / BF16: aproximadamente 67 MB de pesos.
  - INT8: aproximadamente 34 MB (si se convierte manualmente; no se publican pesos cuantizados).
  - INT4: aproximadamente 17 MB (conversion manual).
- GPU recomendadas: cualquier GPU moderna es suficiente. Funciona sin problema en GTX 1060, RTX 2060, RTX 3060, RTX 4090, A100, H100, etc. En la practica, la GPU utilizada es irrelevante por el tamano.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo, e incluso en CPU (con decenas de MB de RAM).
- Opciones de despliegue: PyTorch nativo mediante el codigo de carga provisto (`part1.model.load_pretrained`). El autor indica `sys.path.insert(0, 'code')` antes de importar. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ni pesos en GGUF.
- Latencia y throughput estimados: no disponibles. El modelo no incluye pipeline declarado ni mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Optimizador | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| abhirajratna/anlp-a2-optim-muon | 33,56M | Transformer decoder-only denso (8 capas, d_model 512, 8 cabezas, MLP 2048) | Muon (desde cero) | no disponible | no disponible | HuggingFace |
| abhirajratna/anlp-a2-optim-lion | mismo diseno (variante v1) | Transformer decoder-only denso | Lion (desde cero) | no disponible | no disponible | HuggingFace |
| siddarthg44/anlp-a2-p2-muon | mismo diseno (Parte 1 denso) | Transformer decoder-only denso | Muon (desde cero) | no disponible | no disponible | HuggingFace |

Los tres modelos comparten arquitectura y dataset (`browndw/human-ai-parallel-corpus`), diferenciandose esencialmente en el optimizador empleado. No se dispone de comparativas frente a modelos de proposito general de tamano similar.

## Limitaciones y advertencias

- Modelo puramente academico: desarrollado para una asignatura (ANLP A2), no disenado ni validado para uso en produccion.
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso de uso comercial. Se debe contactar con el autor antes de cualquier uso fuera del ambito academico.
- Calidad de generacion muy baja: un test BLEU de 4.59 sobre continuaciones de 64 tokens indica una fidelidad de texto muy limitada; las salidas no son fiables.
- Riesgo alto de alucinacion y texto incoherente: con solo 33,6M de parametros y 39M de tokens de entrenamiento, el modelo carece de conocimiento factual y de capacidad de razonamiento.
- Idioma: unicamente ingles; no hay soporte multilingue.
- Longitud de contexto desconocida: la model card no especifica la ventana de contexto, y la evaluacion se limita a continuaciones de 64 tokens.
- Dataset especifico: entrenado exclusivamente sobre `browndw/human-ai-parallel-corpus`, lo que sesga su distribucion hacia ese corpus y no hacia texto general.
- Sin alineacion: no se documenta RLHF, DPO ni filtrado de seguridad; puede generar contenido inapropiado o sesgado.
- Sin pipeline declarado: la ausencia de `pipeline` en HuggingFace y de pesos en formatos de inferencia estandar complica su uso directo con herramientas como vLLM o llama.cpp.
- Reproducibilidad dependiente del codigo: la carga requiere el directorio `code` con `part1.model`, lo que puede no estar incluido en el repositorio si este solo contiene pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhirajratna/anlp-a2-optim-muon
- Modelo comparativo con optimizador Lion: https://huggingface.co/abhirajratna/anlp-a2-optim-lion
- Modelo comparativo Muon (otro autor): https://huggingface.co/siddarthg44/anlp-a2-p2-muon
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Documentacion del optimizador Muon en PyTorch: https://docs.pytorch.org/docs/2.14/generated/torch.optim.Muon.html
- Repositorio de la asignatura (referencia): https://github.com/bitmap4/anlp-a2
- Guia de estudio del curso ANLP (referencia): https://github.com/Arihant25/anlp-study-guide
