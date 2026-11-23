# magnooj/qwen3-vl-2b-fracatlas-lora

## Resumen

El modelo `magnooj/qwen3-vl-2b-fracatlas-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `Qwen/Qwen3-VL-2B-Instruct`, un transformer multimodal de 2 mil millones de parametros desarrollado por el equipo Qwen. El adaptador ha sido entrenado por el usuario magnooj para una tarea muy concreta: leer una radiografia musculoesqueletica y generar un informe estructurado de cuatro lineas con cuerpo anatomico, vista, presencia de hardware ortopedico y presencia de fractura. Fue creado como material docente para el laboratorio "Lab 07: How to Fine-Tune a Vision-Language Model" de la RSNA 2026 Deep Learning Lab.

El adaptador no modifica el codificador visual ni el proyector del modelo base, que permanecen congelados; solo se entrenan las proyecciones q, k, v, o, gate, up y down del modelo de lenguaje. Esto da lugar a 17,4 millones de pesos entrenables, un 0,8% del total del modelo. El resultado es un adaptador de apenas 0,1 GB que se puede cargar sobre el modelo base en cualquier GPU consumer moderna, incluida una T4 gratuita de Colab.

La relevancia de esta ficha es doble: por un lado, muestra un caso realista de ajuste fino de un VLM pequeno para una tarea medica estructurada con resultados medibles; por otro, el autor es explicitamente honesto sobre las limitaciones del adaptador, que no es apto para uso clinico y que falla en aproximadamente la mitad de las fracturas del conjunto de test. Es un ejemplo de transparencia en la publicacion de resultados y de buenas practicas de evaluacion (sensibilidad y especificidad en lugar de accuracy en un conjunto desbalanceado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL-2B-Instruct (vision encoder + proyector + LLM) |
| Parametros totales | 17,4 M entrenables en el adaptador (0,8% del modelo base); el base Qwen3-VL-2B-Instruct tiene 2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-2B-Instruct) |
| Tipos de cuantizacion | bf16 y fp16 probados por el autor; no se documentan GGUF ni cuantizaciones de 4/8 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-VL-2B-Instruct`, un modelo vision-lenguaje que combina un codificador de imagenes con un transformer de lenguaje. En este ajuste fino solo se entrenan las matrices de proyeccion del LLM (q, k, v, o, gate, up, down), mientras que el codificador visual y el proyector multimodal permanecen congelados. La configuracion LoRA es rango 16, alpha 32 y dropout 0,05, lo que resulta en 17,4 M de pesos entrenables. La perdida se calcula unicamente sobre los tokens de la respuesta, dejando el prompt y la imagen como contexto.

El entrenamiento se realizo sobre el split de train del dataset `magnooj/fracatlas-vlm-512`, compuesto por 3.258 imagenes a 512 px de resolucion, derivado del dataset publico FracAtlas (CC BY 4.0). Se uso AdamW con learning rate 2e-4, schedule coseno, 5% de warmup, sin weight decay, batch de 8 y 2 epocas (816 pasos), en precision bf16 sobre una unica NVIDIA A100 durante aproximadamente 11 minutos. Las librerias empleadas fueron TRL 1.18.2 (`SFTTrainer`), PEFT 0.22.0 y Transformers 5.23.0. El autor documenta ademas un conjunto de ablaciones (distintos learning rates, rangos y tamanos de dataset) cuyos resultados se incluyen en la carpeta `results/` del repositorio, aunque solo el adaptador principal se distribuye.

## Capacidades

- Generacion de informes radiologicos estructurados de cuatro lineas a partir de una radiografia musculoesqueletica: cuerpo anatomico (mano, pierna, cadera u hombro), vista (frontal, lateral u oblicua), presencia de hardware ortopedico y presencia de fractura.
- Clasificacion binaria de fractura con probabilidad asociada (AUC 0,84 en el conjunto de test), aunque la sensibilidad al umbral por defecto es solo del 51%.
- Deteccion de material de osteosintesis (hardware) con una precision del 99% en test.
- Identificacion del cuerpo anatomico y de la vista radiografica con precisiones del 97% y 94% respectivamente.
- Capacidad de seguir un formato estricto de respuesta (100% de cumplimiento del formato en test, frente al 0% del modelo base).
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (no documentado para este adaptador; el modelo base podria tenerlo, pero el adaptador no lo preserva necesariamente).
- Capacidades multilingues: solo ingles segun la model card.
- Modo thinking, vision o audio adicional: no disponible.

## Casos de uso

- Docencia y formacion en ajuste fino de VLMs: el adaptador y su repositorio asociado sirven como ejemplo completo y reproducible de un pipeline de fine-tuning con LoRA sobre un modelo vision-lenguaje, incluyendo scripts de entrenamiento, evaluacion y ablaciones. Es adecuado porque cabe en una T4 y el entrenamiento completo dura 11 minutos en una A100.
- Prototipado rapido de asistentes de triaje radiologico no clinico: se puede integrar en demos o cuadernos interactivos para mostrar como un VLM pequeno puede aprender a estructurar hallazgos a partir de una imagen, siempre con la advertencia de que no es apto para diagnostico.
- Investigacion sobre sesgos y alucinacion en modelos medicos: el autor publica mapas de oclusion, pruebas con imagenes en blanco, ruido y rotadas, y un mapa t-SNE de caracteristicas del codificador visual. Estos artefactos permiten estudiar como un VLM pequeno alucina informes confiados ante entradas no radiologicas.
- Benchmarking de adaptadores LoRA en tareas medicas: el conjunto de ablaciones (distintos rangos, learning rates y tamanos de dataset) y las metricas de sensibilidad, especificidad y AUC permiten comparar estrategias de ajuste fino en un escenario controlado y reproducible.
- Generacion de informes estructurados en pipelines de investigacion: el adaptador puede usarse para preanotar grandes volumenes de radiografias en estudios retrospectivos, con revision humana posterior obligatoria, gracias a su capacidad de producir salidas parseables en cuatro campos fijos.
- Educacion medica y simulacion: permite construir ejercicios interactivos en los que estudiantes comparan el informe generado por el modelo con el informe real, discuten los falsos negativos y analizan los sesgos del sistema, usando el propio modelo como objeto de estudio critico.

## Benchmarks y rendimiento

Resultados sobre 421 imagenes de test nunca vistas en entrenamiento (prevalencia de fractura del 15%):

| Metrica | Modelo base | Adaptador LoRA |
|---|---|---|
| Sigue el formato | 0% | 100% |
| Cuerpo anatomico correcto | 52% | 97% |
| Vista correcta | 56% | 94% |
| Hardware correcto | 91% | 99% |
| Sensibilidad a fractura | 10% | 51% |
| Especificidad a fractura | 98% | 97% |
| AUC de fractura (P(yes) en "Fracture:") | 0,60 | 0,84 |
| Las cuatro lineas correctas | 28% | 83% |

El autor advierte que, dada la prevalencia del 15%, responder siempre "no fracture" daria un 85% de accuracy, por lo que recomienda reportar sensibilidad y especificidad en lugar de accuracy. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita, pero el modelo base es de 2B parametros y el adaptador pesa 0,1 GB; en bf16 o fp16 el conjunto cabe holgadamente en GPUs consumer con 8-16 GB.
- GPU recomendadas: el autor probo en una NVIDIA A100 para entrenamiento y en una T4 gratuita de Colab para inferencia en fp16. Cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente para inferencia en precision media.
- Cabe en GPU consumer: si, incluidas T4, RTX 3060/4060/4090 y similares.
- Opciones de despliegue: PEFT + Transformers (metodo documentado por el autor); no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-vl-2b-fracatlas-lora (este) | 17,4 M adaptador sobre 2B | no disponible | Informe radiologico estructurado | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct (base) | 2B | no disponible | Vision-lenguaje general | Apache-2.0 | Hugging Face |
| Alternativas medicas especializadas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de la misma categoria en la documentacion proporcionada. La comparacion mas directa es con el modelo base, cuyos resultados se incluyen en la tabla de benchmarks.

## Limitaciones y advertencias

- El propio autor indica explicitamente: "Teaching material only. Not for clinical use." No debe usarse para diagnostico ni decision clinica.
- Sensibilidad a fractura de aproximadamente el 51% en el umbral por defecto: se pierde aproximadamente la mitad de las fracturas del conjunto de test. La probabilidad (AUC 0,84) es mejor ranker que la respuesta binaria.
- Alucinacion: el modelo genera informes confiados ante imagenes en blanco, ruido o que no son radiografias.
- Atajos aprendidos: puede etiquetar joyas como "hardware" y confundirlas con fracturas.
- Rotar una imagen puede cambiar la vista reportada por el modelo.
- Entrenado con un unico dataset publico procedente de tres hospitales, sin validacion externa; el rendimiento en otros dominios o equipos es desconocido.
- Solo soporta ingles; no se documentan capacidades multilingues.
- La licencia Apache-2.0 permite uso comercial del adaptador, pero las limitaciones clinicas y de alucinacion hacen inviable su uso en produccion sanitaria sin supervision humana intensiva.
- El adaptador no preserva necesariamente todas las capacidades del modelo base (tool calling, agentes, razonamiento multi-paso); no se han evaluado en la informacion disponible.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/magnooj/qwen3-vl-2b-fracatlas-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/magnooj/fracatlas-vlm-512
- Repositorio del laboratorio RSNA: https://github.com/RSNA/AI-Deep-Learning-Lab-2026/tree/main/07-Fine-Tuning-Vision-Language-Models/training
- Paper de FracAtlas: https://doi.org/10.1038/s41597-023-02432-4
