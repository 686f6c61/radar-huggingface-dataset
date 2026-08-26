# jiahueic/juristiq-myinvois-specialist-synthetic-v2

## Resumen

Este modelo es un adaptador LoRA de tipo *fine-tuning* supervisado (SFT) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario jiahueic. Su nombre, `myinvois-specialist-synthetic-lora-v2`, sugiere que está especializado en el procesamiento de facturas electrónicas del sistema MyInvois de Malasia, aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni sobre las tareas concretas. El adaptador se ha entrenado con la librería TRL de Hugging Face y se distribuye en formato PEFT.

La relevancia de este modelo radica en su tamaño reducido (0.5B de parámetros base) y su enfoque en un dominio específico, lo que lo hace adecuado para despliegues con recursos limitados. Sin embargo, la información pública es muy escasa: no se especifican los datos de entrenamiento, los benchmarks ni las capacidades concretas. El modelo se enmarca dentro del ecosistema JuristIQ de la plataforma Juristic, orientada al trabajo legal visual, aunque no hay evidencia de que este adaptador esté directamente relacionado con el producto comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 0.5B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precision completa; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-0.5B-Instruct soporta principalmente ingles y chino, con capacidad multilingue limitada) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con 0.5 mil millones de parametros. La arquitectura base incluye atencion por ventanas deslizantes y un tokenizador con vocabulario de 151 936 tokens. El adaptador se entreno mediante SFT (supervised fine-tuning) usando la libreria TRL, con las versiones PEFT 0.20.0, Transformers 5.15.1 y PyTorch 2.13.0. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo indica que el dataset fue sintetico, pero no hay detalles publicos.

## Capacidades

- Generacion de texto conversacional: el modelo hereda la capacidad de Qwen2.5-0.5B-Instruct para mantener dialogos multi-turno.
- Especializacion en facturacion electronica MyInvois: segun el nombre del modelo, esta afinado para tareas relacionadas con el sistema MyInvois de Malasia, aunque no se documentan las tareas exactas.
- Soporte de tool calling: el modelo base Qwen2.5-0.5B-Instruct soporta function calling, por lo que el adaptador probablemente conserva esta capacidad, aunque no esta confirmado.
- Capacidades multilingues: limitadas, heredadas del modelo base (principalmente ingles y chino).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Extraccion de datos de facturas: el modelo podria utilizarse para extraer campos clave (numero de factura, importe, IVA, proveedor) de documentos de facturacion electronica, aunque no hay evidencia publica de su rendimiento en esta tarea.
- Validacion de facturas: podria asistir en la comprobacion de que una factura cumple los requisitos del sistema MyInvois, como el formato de los campos obligatorios.
- Clasificacion de facturas: podria categorizar facturas por tipo, proveedor o departamento, aprovechando el contexto de 32k tokens para documentos largos.
- Asistente de consultas sobre facturacion: integrado en un chatbot, podria responder preguntas sobre el estado de facturas o sobre el proceso de envio a MyInvois.
- Generacion de resumenes de facturas: podria resumir facturas extensas o multiples facturas en un unico documento, gracias a su ventana de contexto amplia.
- Automatizacion de procesos de cuentas a pagar: en un pipeline de automatizacion, el modelo podria preprocesar facturas antes de su aprobacion, aunque su tamano reducido limita la precision en tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de tareas especificas de facturacion. El rendimiento real del adaptador es desconocido.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5B en precision FP16 ocupa aproximadamente 1 GB de VRAM. Con el adaptador LoRA, el uso adicional es minimo (menos de 100 MB). En cuantizacion INT4, el modelo base puede caber en menos de 500 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores funcionan sin problemas. Tambien puede ejecutarse en CPU con llama.cpp.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con PEFT, TGI. Al ser un adaptador PEFT, requiere cargar el modelo base y el adaptador por separado.
- Latencia y throughput: no disponibles. Para un modelo de 0.5B, se espera una latencia de decenas de milisegundos por token en GPU moderna, pero no hay mediciones publicas.

## Comparativa con modelos similares

No hay modelos comparables publicamente documentados con la misma especializacion en MyInvois. Como referencia generica de modelos pequenos de 0.5B:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 32k | Apache 2.0 | Generico |
| TinyLlama-1.1B | 1.1B | 2k | Apache 2.0 | Generico |
| Phi-3-mini | 3.8B | 128k | MIT | Generico |

El modelo evaluado es un adaptador sobre Qwen2.5-0.5B, por lo que su rendimiento base es el de Qwen2.5-0.5B-Instruct, con una posible mejora en tareas de facturacion si el dataset de entrenamiento fue adecuado. No hay datos para comparar.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Qwen2.5-0.5B-Instruct puede presentar sesgos presentes en sus datos de entrenamiento, que no estan documentados para este adaptador.
- Riesgo de alucinacion: al ser un modelo de solo 0.5B, la probabilidad de generar informacion incorrecta o inventada es alta, especialmente en tareas de facturacion donde la precision es critica.
- Limitaciones de contexto: aunque la ventana es de 32k tokens, el modelo base de 0.5B tiene una capacidad limitada para aprovechar contextos muy largos de forma coherente.
- Restricciones de licencia: la licencia no esta especificada, lo que impide conocer si se permite uso comercial. Se recomienda contactar al autor antes de cualquier uso en produccion.
- Falta de documentacion: no hay informacion sobre el dataset de entrenamiento, el proceso de evaluacion ni las tareas exactas para las que fue optimizado. Esto hace arriesgado su uso en entornos profesionales sin validacion previa.
- Dependencia del modelo base: el adaptador requiere cargar Qwen2.5-0.5B-Instruct, que tiene su propia licencia Apache 2.0, pero el adaptador en si podria tener restricciones adicionales no declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiahueic/juristiq-myinvois-specialist-synthetic-v2
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Producto JuristIQ (Juristic): https://www.juristic.io/product/juristiq
- Plataforma Juristic: https://www.juristic.io/
- Base de conocimiento de Juristic: https://help.juristic.io/platform
- Repositorio del autor en GitHub: https://github.com/jiahueic/jiahueic
