# shikunpunk/Qwen3.8-27B-Haizi-KTO

## Resumen

El modelo `shikunpunk/Qwen3.8-27B-Haizi-KTO` es un adaptador LoRA de post-entrenamiento mediante KTO (Kahneman-Tversky Optimization) diseñado para transferir el estilo poético del poeta chino Haizi sobre la base del modelo `Qwen/Qwen3.8-27B`. El autor, shikunpunk, lo presenta como la segunda etapa de un pipeline de dos fases: primero un ajuste fino supervisado (SFT) con un adaptador LoRA que enseña el estilo, y después este adaptador KTO que refuerza la preferencia hacia textos que se asemejan a la poesía real de Haizi frente a texto no poético.

El adaptador es extremadamente ligero (0.2 GB) y se distribuye en formato safetensors, pensado para cargarse mediante la librería `peft` sobre el modelo base cuantizado. El entrenamiento se realizó con un conjunto de datos muy reducido (64 pares, 128 muestras) etiquetado como deseable (poemas auténticos de Haizi) y no deseable (texto no poético), con configuración LoRA de r=16, alpha=32 y dropout de 0.05, durante 3 épocas. La elección de KTO en lugar de DPO se justifica por limitaciones de memoria VRAM (27B + 40 GB), ya que KTO solo requiere un modelo de referencia en lugar de dos.

Este modelo es relevante para investigadores y desarrolladores interesados en la transferencia de estilo literario, el alineamiento de preferencias con pocos datos y el uso de técnicas de optimización alternativas a DPO en entornos con recursos limitados. No obstante, su utilidad práctica se limita a la generación de texto en chino con un estilo poético muy específico, y carece de documentación sobre rendimiento general o capacidades más amplias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.8-27B (transformer, sin especificar detalles) |
| Parametros totales | No disponible (el adaptador ocupa 0.2 GB; el modelo base es de 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se usa con cuantizacion 4-bit del modelo base segun el ejemplo de uso) |
| Idiomas soportados | No disponible (por el caso de uso, probablemente chino, pero no se confirma) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen3.8-27B`, del que no se proporcionan detalles arquitectonicos en la informacion disponible (probablemente un transformer denso de 27B parametros, pero no se confirma). El entrenamiento utiliza KTO (Kahneman-Tversky Optimization), una variante de optimizacion de preferencias que, a diferencia de DPO, no requiere un par de modelos (policy y reference) sino un solo modelo, lo que reduce los requisitos de memoria. Esto fue decisivo para el autor, que menciona que con 27B y 40 GB de VRAM el enfoque DPO tradicional provocaba OOM.

Los datos de entrenamiento consisten en 64 pares (128 muestras) con etiquetas de preferencia: las muestras deseables son poemas reales de Haizi y las no deseables son texto no poetico. El adaptador LoRA se configuro con r=16, alpha=32 y dropout=0.05, y se entreno durante 3 epocas. Las metricas reportadas incluyen una perdida de entrenamiento que desciende de 0.080 a 0.039 (con una perdida final de 0.127) y un valor de KTO rewards/margins de 30.05. No se especifican detalles sobre el dataset, el tokenizador ni el proceso de curacion de los datos.

## Capacidades

- Generacion de texto en chino con estilo poetico imitando a Haizi, gracias al entrenamiento de preferencias sobre poemas reales del autor.
- Transferencia de estilo: el adaptador esta disenado para transformar texto generico en composiciones que se asemejan a la poesia de Haizi, siempre que se combine con el adaptador SFT previo (no incluido en este repositorio).
- Alineamiento de preferencias con pocos datos: demuestra que KTO puede ajustar un modelo grande con un conjunto de datos minimo (64 pares) sin agotar la memoria.
- Integracion con el ecosistema Hugging Face: se carga mediante `PeftModel` y funciona con cuantizacion 4-bit (BitsAndBytes) para inferencia en hardware limitado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio. El adaptador es exclusivamente para generacion de texto.

## Casos de uso

- Generacion de poesia china en el estilo de Haizi: el adaptador puede usarse para producir poemas que imiten la sensibilidad lirica del poeta, por ejemplo en aplicaciones de creatividad literaria o educacion cultural.
- Transferencia de estilo en textos literarios: dado un texto de entrada, el modelo puede reescribirlo con un tono poetico similar al de Haizi, util en herramientas de escritura asistida.
- Experimentacion academica en alineamiento de preferencias: investigadores pueden estudiar como KTO con datos extremadamente pequenos afecta al comportamiento de un modelo de 27B, comparandolo con DPO u otros metodos.
- Prototipos de generacion de contenido para redes sociales o publicaciones culturales: generar citas o fragmentos poeticos para acompanar imagenes o posts, siempre que se respete la licencia (no disponible).
- Evaluacion de robustez del adaptador: probar la coherencia y fidelidad estilistica en diferentes dominios textuales (prosa, dialogo, etc.) para entender los limites del ajuste.
- Educacion y divulgacion: crear ejemplos de poesia china contemporanea para cursos de literatura, con la advertencia de que el modelo puede alucinar o mezclar estilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento (loss y KTO rewards), sin comparaciones con otros modelos ni evaluaciones en tareas estandar como MMLU, HumanEval o GSM8K. Tampoco se ofrecen datos de latencia o throughput.

## Requisitos de hardware

- El adaptador en si es muy pequeno (0.2 GB), pero requiere cargar el modelo base `Qwen/Qwen3.8-27B` completo, que ocupa aproximadamente 54 GB en precision fp16 (27B x 2 bytes).
- Con cuantizacion 4-bit (NF4) mediante BitsAndBytes, el modelo base puede reducirse a unos 13.5 GB, lo que permite inferencia en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). Con cuantizacion 8-bit, el uso de VRAM rondaria los 27 GB, requiriendo GPUs profesionales como A100 (40 GB) o H100.
- El ejemplo de uso en la model card emplea `device_map="auto"` y cuantizacion 4-bit, sugiriendo que el autor probo el modelo en un entorno con al menos 24 GB de VRAM.
- Opciones de despliegue: dado que es un adaptador PEFT, se puede integrar en pipelines de `transformers` con `PeftModel`. Para servidores de produccion, habria que fusionar el adaptador con el modelo base (usando `merge_and_unload`) y luego servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan datos de latencia ni throughput.
- Se recomienda una GPU con al menos 16 GB de VRAM para cuantizacion 4-bit, aunque 24 GB es mas seguro para margen de memoria.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo base `Qwen/Qwen3.8-27B` no corresponde a ninguna familia publica conocida de Qwen (las versiones oficiales son Qwen2.5-27B o Qwen3-30B-A3B), por lo que no se puede verificar su existencia ni sus caracteristicas. Tampoco hay datos de rendimiento del adaptador frente a otros modelos de poesia china o de transferencia de estilo. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Sesgos y alucinacion: al entrenarse con solo 64 pares de datos, el adaptador puede sobreajustarse a los ejemplos concretos y generar texto que imite superficialmente a Haizi sin comprender el significado, o mezclar fragmentos de diferentes poemas. No se ha evaluado su comportamiento ante entradas fuera del dominio poetico.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar citas o atribuciones erroneas. No se recomienda su uso para citar poemas reales sin verificacion humana.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada ni los idiomas. Por el caso de uso, se asume chino, pero no hay garantia. El adaptador puede degradarse en otros idiomas.
- Restricciones de licencia: la licencia no esta disponible, lo que impide conocer si su uso comercial esta permitido. Se debe contactar al autor antes de cualquier despliegue en produccion.
- Datos de entrenamiento muy reducidos: 128 muestras son insuficientes para garantizar generalizacion. El adaptador es un experimento de investigacion mas que un producto listo para produccion.
- Dependencia del adaptador SFT previo: el autor indica que este adaptador KTO debe usarse junto con un adaptador SFT de estilo, pero no se proporciona el enlace a ese adaptador, lo que limita su reproducibilidad.
- Compatibilidad: el nombre `Qwen3.8-27B` sugiere una version no estandar del modelo base; si el modelo base no esta disponible publicamente, el adaptador no podra utilizarse.

## Enlaces

- [HuggingFace: shikunpunk/Qwen3.8-27B-Haizi-KTO](https://huggingface.co/shikunpunk/Qwen3.8-27B-Haizi-KTO)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (no verificado)
- La model card menciona un repositorio GitHub con codigo y datos, pero no se proporciona la URL.
