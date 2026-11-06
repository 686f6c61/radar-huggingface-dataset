# arun-elr/retro-lm-1.7b

## Resumen

Retro-LM 1.7B es un modelo de lenguaje especializado en retrosíntesis química, desarrollado por el usuario arun-elr y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-1.7B-Base, orientado a la generación de rutas de retrosíntesis y al trabajo con representaciones SMILES de moléculas. Con 1.720.574.976 parámetros, se posiciona en la gama de modelos pequenos, adecuados para despliegue en hardware modesto.

El modelo hereda la arquitectura transformer de la familia Qwen3 y la licencia Apache 2.0 del modelo base, lo que facilita su uso comercial. Su especialización en química lo hace relevante para investigadores y desarrolladores que necesitan asistencia automatizada en el diseno de rutas sinteticas, un problema clasico en el descubrimiento de farmacos y la quimica computacional.

La informacion publica disponible es muy limitada: no se han publicado resultados de benchmarks, detalles del dataset de ajuste fino ni idiomas soportados. Ademas, el acceso al modelo esta restringido (gated) y requiere aceptar condiciones en Hugging Face. Esta ficha se basa exclusivamente en los metadatos del repositorio y en la informacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Retro-LM 1.7B es un ajuste fino del modelo Qwen/Qwen3-1.7B-Base, un transformer decoder-only de la familia Qwen3. No se dispone de informacion publica sobre la composicion del dataset de ajuste fino, el numero de tokens utilizados, ni si se emplearon tecnicas de RLHF o DPO. Dado el dominio declarado (retrosintesis, SMILES, quimica), es razonable inferir que el ajuste se realizo sobre corpus de reacciones quimicas y pares molecula-ruta sintetica, pero este extremo no esta confirmado en la informacion proporcionada.

No se han documentado innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento extendido) especificas de este ajuste. Las capacidades arquitectonicas subyacentes corresponden a las del modelo base Qwen3-1.7B-Base, cuyos detalles completos no se incluyen en la informacion disponible.

## Capacidades

- Generacion de texto especializada en quimica, con enfasis en retrosintesis.
- Generacion y manipulacion de cadenas SMILES para representar moleculas.
- Razonamiento sobre rutas sinteticas y transformaciones quimicas.
- Generacion de texto general heredada del modelo base Qwen3-1.7B-Base.
- Soporte de tool calling / function calling: no disponible (no confirmado para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Planificacion retrosintetica asistida: el modelo puede proponer rutas de retrosintesis a partir de una molecula objetivo expresada en SMILES, ayudando a quimicos medicinales a explorar alternativas sinteticas antes de la validacion experimental.
- Generacion de candidatos sinteticos en descubrimiento de farmacos: integrado en pipelines de quimica computacional, puede sugerir precursores y reacciones para moleculas candidatas, reduciendo el numero de hipotesis que un equipo debe evaluar manualmente.
- Normalizacion y validacion de SMILES: el ajuste sobre representaciones SMILES permite usar el modelo para tareas de limpieza, canonicalizacion o traduccion entre representaciones dentro de un pipeline de datos quimicos.
- Asistencia en documentacion cientifica: generacion de descripciones de rutas sinteticas y resumenes de esquemas de reaccion para articulos, patentes o informes internos.
- Prototipado rapido en entornos con recursos limitados: con 1.7B parametros, puede desplegarse en una unica GPU consumer para experimentacion academica o pruebas de concepto sin infraestructura dedicada.
- Educacion y formacion en quimica sintetica: como herramienta de apoyo para estudiantes que practican el razonamiento retrosintetico, con la supervision de un experto para validar las propuestas.
- Filtrado previo en cribado virtual: uso del modelo para descartar rutas sinteticas inviables antes de recurrir a herramientas de planificacion mas costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.5 GB en precision completa (fp16/bf16), coherente con el tamano del repositorio de 3.5 GB; en cuantizacion de 8 bits se situaria en torno a 1.8-2 GB y en 4 bits en torno a 1-1.2 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; GPUs de datacenter como A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con VRAM suficiente.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| Retro-LM 1.7B | 1.72B | no disponible | Apache 2.0 | Retrosintesis / SMILES | Gated en Hugging Face |
| Qwen/Qwen3-1.7B-Base | 1.72B | no disponible | Apache 2.0 | Proposito general | Publico |
| Alternativas quimicas de 1-2B | no disponible | no disponible | no disponible | Quimica | no disponible |

La comparacion con modelos especializados en quimica de tamano similar no puede completarse con la informacion disponible. El referente inmediato es su modelo base Qwen3-1.7B-Base, del que hereda arquitectura y licencia pero del que difiere en el ajuste de dominio.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de su descarga.
- Ausencia de benchmarks: no hay evidencia publica de su rendimiento en tareas de retrosintesis, lo que impide validar su calidad frente a alternativas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar rutas sinteticas quimicamente invalidas o SMILES mal formados; toda propuesta requiere validacion por un experto o por herramientas de quimica computacional.
- Sesgos: no documentados, pero el ajuste sobre un corpus de dominio puede introducir sesgos hacia ciertas clases de reacciones o familias de compuestos.
- Limitaciones de contexto e idioma: no disponibles; se desconoce si el ajuste degrada el multilingueismo del modelo base.
- Uso comercial: la licencia Apache 2.0 del modelo base permite uso comercial, pero debe verificarse que las condiciones del acceso gated no anadan restricciones adicionales.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arun-elr/retro-lm-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
