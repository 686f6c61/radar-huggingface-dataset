# alihamad24/qwen25-1.5b-terraform-lora

## Resumen

`alihamad24/qwen25-1.5b-terraform-lora` es un ajuste fino mediante LoRA (fusionado en los pesos finales) del modelo `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por Ali Ahmed Hamad en el marco del módulo CE893-7-AU-CO (Generative Artificial Intelligence) de la Universidad de Essex. El modelo está especializado en traducir descripciones en lenguaje natural de infraestructura cloud a código Terraform HCL válido y desplegable, sin vallas de Markdown ni prosa adicional.

Se trata de un transformer causal decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado de la familia Qwen2.5, con licencia Apache 2.0. El modelo base aporta una ventana de contexto de 32.768 tokens, aunque el entrenamiento del ajuste se realizó con una longitud máxima de secuencia de 2048 tokens. El repositorio ocupa 3,3 GB e incluye pesos en safetensors y una variante GGUF.

Su relevancia radica en que aborda una tarea muy concreta del ciclo DevOps —la generación de infraestructura como código multi-cloud— con un modelo pequeño que puede ejecutarse en hardware modesto. El autor documenta un proceso de curación de datos con verificación sintáctica mediante `python-hcl2` y `terraform fmt`, y una división libre de fugas basada en similitud TF-IDF, lo que aporta trazabilidad metodológica poco habitual en ajustes de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2.5), ajuste LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; 2048 tokens de secuencia máxima durante el ajuste |
| Tipos de cuantizacion | safetensors en bf16/fp16; GGUF (variante publicada en el repo) |
| Idiomas soportados | Ingles (entrada); salida en HCL/Terraform |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct` (revision `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`), un transformer decoder-only con atención completa estándar y RoPE. Sobre él se aplicó un LoRA de rango r=32, alpha=64, dropout 0,05, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó en bf16 (sin QLoRA), con optimizador de schedule coseno, learning rate 2e-4, warmup ratio 0,05, batch efectivo de 16 (4 por dispositivo × 4 pasos de acumulación), 4 épocas, longitud máxima de 2048 y semilla 42. El checkpoint final se seleccionó por menor `eval_loss` en validación.

Los datos provienen de un subconjunto limpio y verificado de `SASVAAI/terraform-multicloud` (15.000 registros crudos inspeccionados). El preprocesado incluyó eliminación de vallas Markdown, verificación de cada bloque HCL de referencia con `python-hcl2` y `terraform fmt -` (descartando registros inválidos), eliminación de duplicados exactos y agrupación de prompts casi duplicados (similitud coseno TF-IDF ≥ 0,90) en componentes conexas antes de dividir en 10.000 ejemplos de entrenamiento, 200 de validación y 150 de test reservado, evitando fugas de paráfrasis entre particiones. No se documenta RLHF ni DPO adicional.

## Capacidades

- Generación de código Terraform HCL a partir de descripciones en inglés de infraestructura cloud, con salida limpia sin vallas de Markdown ni explicaciones.
- Cobertura multi-cloud (AWS, y otros proveedores presentes en el dataset `terraform-multicloud`), incluyendo recursos como buckets S3, ACL, redes y almacenamiento.
- Generación de configuraciones de arranque (starter configs) listas para pasar por `terraform validate` y `terraform plan`.
- Formato conversacional: acepta plantilla de chat con mensajes de sistema y usuario mediante `apply_chat_template`.
- Capacidad de razonamiento y código heredada del modelo base Qwen2.5-1.5B-Instruct, aunque degradada para usos generales por la especialización.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Generación de esqueletos de infraestructura multi-cloud: un ingeniero describe en inglés un bucket S3 privado, una VPC o una base de datos, y el modelo emite el HCL correspondiente que luego se valida con `terraform validate` y `terraform plan` antes de aplicar.
- Aceleración del onboarding en equipos DevOps: permite a perfiles junior obtener una primera versión de configuración Terraform a partir de requisitos en lenguaje natural, reduciendo el tiempo hasta el primer borrador revisable.
- Prototipado rápido de entornos de prueba: generar configuraciones de recursos efímeros (almacenamiento, redes) para entornos de staging que se destruyen tras las pruebas, con revisión humana obligatoria.
- Asistente en pipelines de CI/CD: integrado como paso de generación previa a `terraform fmt` y `terraform validate`, puede producir borradores que un revisor humano o un escáner de seguridad (`tfsec`, `checkov`) valida antes del `apply`.
- Educación y formación en IaC: útil para demostrar la correspondencia entre una petición en lenguaje natural y el HCL resultante, con la advertencia de que la salida debe auditarse siempre.
- Automatización de tareas repetitivas de infraestructura: generación de bloques de recursos con estructuras similares (por ejemplo, múltiples buckets o políticas) a partir de plantillas descriptivas, siempre con revisión de seguridad.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1,5B parámetros, puede ejecutarse en una sola GPU de consumo o incluso en CPU con cuantización GGUF, lo que facilita su uso en estaciones de trabajo de desarrolladores.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 150 ejemplos de test reservado con decodificación greedy (`do_sample=False`, `max_new_tokens=2048`), puntuando cada salida en una escala de 0 a 2 (2 = totalmente correcto, 1 = parcialmente correcto, 0 = inválido). La tabla de resultados en la model card aparece truncada en la información disponible: solo se muestra la fila del baseline zero-shot con un 76,% en sintaxis HCL válida, sin el resto de columnas ni la fila del modelo ajustado.

| Condicion | HCL valido (%) | Score 2 (%) | Score 1 (%) | Score 0 (%) | Adiciones no soportadas (%) | Score medio (0-2) |
|---|---|---|---|---|---|---|
| Baseline zero-shot | 76,% (dato truncado) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelo ajustado | no disponible | no disponible | no disponible | no disponible | 31,33 | no disponible |

El único dato adicional explícito en la model card es que el 31,33% de las salidas del modelo ajustado en el test reservado incluyeron bloques de recursos extra no presentes en la configuración de referencia. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB para secuencias moderadas.
- VRAM estimada con cuantización GGUF de 4 bits: del orden de 1-1,5 GB para pesos, lo que permite ejecución en CPU o en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). En consumer GPU cabe sin problema en RTX 3060/4060 en adelante; en GPUs de 4 GB conviene usar GGUF cuantizado.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (como muestra la model card), llama.cpp/Ollama mediante el archivo GGUF del repositorio, y servidores compatibles con la API de transformers (el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints). No se documenta compatibilidad explícita con vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (1,5B) y el contexto de entrenamiento de 2048 tokens, se espera una generación de decenas de tokens por segundo en GPUs de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-1.5b-terraform-lora | 1,54B | 32.768 (base); 2048 en ajuste | Terraform HCL multi-cloud | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 | Instrucciones generales, chat, código | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32.768 | Código general (no específico de Terraform) | Apache 2.0 | Hugging Face |
| Modelos IaC de mayor tamaño (p. ej. variantes de 7B ajustadas a Terraform) | ~7B | variable | Terraform HCL | variable | Hugging Face |

La comparación con modelos de 7B ajustados a IaC es cualitativa: no se dispone de benchmarks comparativos publicados en la información proporcionada. Frente al modelo base, la especialización mejora la adherencia al formato HCL pero degrada el rendimiento conversacional general, tal como advierte el propio autor.

## Limitaciones y advertencias

- Deriva de esquemas de proveedor: los argumentos de los providers de Terraform evolucionan con frecuencia; el modelo puede emitir atributos obsoletos u omitir campos requeridos recientemente.
- Valores por defecto inseguros: las configuraciones generadas pueden usar ajustes permisivos (bloques CIDR abiertos, almacenamiento sin cifrar) salvo que se restrinjan explícitamente en el prompt.
- Adiciones no soportadas: el 31,33% de las salidas del test reservado incluyeron bloques de recursos extra no presentes en la referencia, lo que exige revisión humana.
- Uso en producción no revisado: el autor desaconseja explícitamente aplicar configuraciones sin pasar por `terraform fmt`, `terraform validate`, `terraform plan` y un escáner de seguridad (`tfsec`, `checkov`).
- Degradación del chat general: el ajuste está especializado en HCL; el rendimiento conversacional general puede ser inferior al del modelo base Qwen2.5-1.5B-Instruct.
- Idioma: solo se documenta inglés como idioma de entrada; no hay evidencia de soporte para peticiones en castellano.
- Sesgos: no se documentan sesgos específicos más allá de los heredados del modelo base y del dataset de entrenamiento.
- Riesgo de alucinación: presente, especialmente en nombres de recursos, atributos de provider y valores por defecto no contemplados en el dataset.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las obligaciones de atribución y aviso de la licencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alihamad24/qwen25-1.5b-terraform-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/SASVAAI/terraform-multicloud
- Repositorio del modelo fusionado referenciado en la model card: https://huggingface.co/alihamad24/qwen2.5-1.5b-terraform-merged
- Documentación de Terraform (HashiCorp): https://developer.hashicorp.com/terraform
- `python-hcl2`: https://pypi.org/project/python-hcl2/
- `tfsec`: https://github.com/aquasecurity/tfsec
- `checkov`: https://github.com/bridgecrewio/checkov
