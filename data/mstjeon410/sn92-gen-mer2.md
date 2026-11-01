# MstJeon410/sn92-gen-mer2

## Resumen

sn92-gen-mer2 es un fine-tune del modelo base baselabs/mammoth-1, publicado por el usuario MstJeon410 en HuggingFace. Se presenta como una entrada "generalista" (SN92 generalist entry) dentro de lo que el autor denomina modelos de decisión (decision-model), y utiliza el layout de lectura conjunta REAX, que combina un backbone Qwen3_5Model con una cabeza de lectura (readout head) adicional. El modelo tiene 26.085.330.160 parámetros (aproximadamente 26.000 millones) y un tamaño de repositorio de 52,2 GB en formato safetensors.

La relevancia de este modelo es limitada y muy específica: se trata de un fine-tune reciente (octubre de 2026) con solo 22 descargas y ningún "like", sin model card detallada más allá de una nota breve que remite a los archivos MODIFICATIONS.md, NOTICE y LICENSE del repositorio. No se documentan datos de entrenamiento, benchmarks ni idiomas soportados. La licencia es MIT, lo que facilita su reutilización, pero la ausencia de documentación técnica hace que cualquier evaluación rigurosa requiera inspeccionar directamente los archivos del repositorio.

Por tanto, esta ficha se basa únicamente en los metadatos disponibles en HuggingFace y en la información del modelo base, y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model backbone + readout head (layout REAX de lectura conjunta) |
| Parametros totales | 26.085.330.160 (aprox. 26,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se describe como un fine-tune de baselabs/mammoth-1 (commit 61cec44c281c693992e3d6ebeb44dd3402dfa186) en el layout REAX de lectura conjunta, que según la model card combina un backbone Qwen3_5Model con una cabeza de lectura (readout head). Esto sugiere una arquitectura transformer derivada de la familia Qwen3.5, con un componente adicional de decisión o clasificación superpuesto al backbone generativo. No se especifica si el backbone es denso o de mezcla de expertos, ni el número de capas, dimensiones ocultas o cabezas de atención.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o técnicas de alineación, ni sobre innovaciones como decodificación especulativa o atención lineal. La model card remite a los archivos MODIFICATIONS.md, NOTICE y LICENSE del repositorio para más detalles, pero esos contenidos no se incluyen en la información disponible. El tag "decision-model" sugiere que el fine-tune está orientado a tareas de decisión o selección, posiblemente mediante la cabeza de lectura conjunta, pero no se detalla el mecanismo.

## Capacidades

- Generación de texto: al estar basado en un backbone Qwen3_5Model, se espera capacidad generativa, aunque no se documenta explícitamente.
- Modelo de decisión: el tag "decision-model" y la cabeza de lectura REAX indican un uso orientado a tareas de decisión o clasificación, sin detalle sobre el formato de salida.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Razonamiento, código y matemáticas: no disponible (no hay benchmarks ni documentación).

## Casos de uso

- Evaluación de modelos de decisión en investigación: el modelo puede utilizarse como punto de partida para experimentos sobre el layout REAX de lectura conjunta, comparando su comportamiento con el modelo base mammoth-1 en tareas de selección o clasificación. Es adecuado porque el autor lo publica como "entrada generalista" de una familia de modelos de decisión.
- Fine-tuning posterior sobre dominios específicos: al tener licencia MIT y pesos en safetensors, se puede reentrenar o adaptar con LoRA sobre datos propios para tareas de decisión en dominios concretos, siempre que se validen previamente sus capacidades base.
- Reproducción de experimentos del autor: sirve para replicar el fine-tune sobre baselabs/mammoth-1 en el commit indicado y verificar los cambios documentados en MODIFICATIONS.md.
- Análisis de arquitecturas híbridas backbone + readout: útil para estudiar cómo una cabeza de lectura adicional afecta a la representación del backbone Qwen3_5Model en tareas de decisión.
- Prototipado de sistemas de enrutamiento o selección: si la cabeza de lectura produce puntuaciones de decisión, podría integrarse en pipelines de enrutamiento, aunque requiere validación empírica no documentada.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT permite uso comercial sin restricciones adicionales, lo que facilita su integración en productos propietarios una vez validado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1 mil millones de parámetros, en FP16 se requieren aproximadamente 52 GB de VRAM (coincide con el tamaño del repo de 52,2 GB). En cuantización de 8 bits, unos 26 GB; en 4 bits, unos 13-14 GB.
- GPU recomendadas: para FP16, A100 80 GB, H100 80 GB o dos GPU de 40 GB en paralelo. Para 8 bits, A100 40 GB o RTX 6000 Ada. Para 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen ajustado.
- ¿Cabe en GPU de consumo? Sí, en cuantización de 4 bits cabe en RTX 4090/3090 (24 GB) y posiblemente en GPUs de 16 GB con cuantizaciones más agresivas, aunque no se publican versiones GGUF oficiales.
- Opciones de despliegue: no se documentan; al ser safetensors, es compatible con vLLM, TGI o Transformers si la arquitectura Qwen3_5Model está soportada. No hay versiones GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sn92-gen-mer2 | 26,1 mil millones | no disponible | MIT | HuggingFace (22 descargas) | Fine-tune de mammoth-1 con layout REAX |
| baselabs/mammoth-1 | no disponible | no disponible | no disponible | HuggingFace (modelo base) | Modelo base del fine-tune |
| Qwen3.5 (familia) | no disponible | no disponible | no disponible | HuggingFace | Backbone declarado del layout |

No se dispone de datos de rendimiento para comparar; la comparativa se limita a parámetros, licencia y disponibilidad. No se conocen alternativas directas con el mismo layout REAX.

## Limitaciones y advertencias

- Documentación muy escasa: la model card no detalla datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide garantizar su comportamiento en producción.
- Riesgo de alucinación: no evaluado ni documentado; al ser un fine-tune de un modelo generativo, el riesgo persiste y no hay métricas que lo acoten.
- Sesgos conocidos: no documentados; se heredan potencialmente los del modelo base y los del dataset de fine-tune, que no se especifica.
- Limitaciones de contexto e idioma: no disponibles; no se puede confirmar la ventana de contexto ni la cobertura multilingüe.
- Licencia MIT: permite uso comercial y modificación, pero el autor remite a NOTICE y LICENSE del repositorio, que deben revisarse por posibles atribuciones adicionales del modelo base.
- Madurez: solo 22 descargas y ningún "like" en el momento de la consulta; no hay evidencia de validación por la comunidad.
- Compatibilidad de despliegue: al no publicarse versiones cuantizadas ni confirmarse el soporte de la arquitectura Qwen3_5Model en frameworks de inferencia, el despliegue puede requerir trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MstJeon410/sn92-gen-mer2
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Commit del modelo base referenciado: 61cec44c281c693992e3d6ebeb44dd3402dfa186 (en el repositorio de baselabs/mammoth-1)
- Archivos del repositorio a revisar: MODIFICATIONS.md, NOTICE, LICENSE (disponibles en la raíz del repositorio de HuggingFace)
