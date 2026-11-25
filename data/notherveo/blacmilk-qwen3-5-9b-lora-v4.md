# notherveo/blacmilk-qwen3.5-9b-lora-v4

## Resumen

BLACMILK · Qwen3.5-9B es un adaptador LoRA (QLoRA SFT) publicado por el usuario notherveo sobre el modelo base Qwen/Qwen3.5-9B. Su proposito es convertir una descripcion de idea en un proyecto Next.js completo y compilable: App Router, Tailwind CSS v4, componentes shadcn/ui y despliegue previsto en Vercel. No es un modelo entrenado desde cero, sino un ajuste fino de bajo rango que se carga sobre los pesos del modelo base mediante la libreria PEFT.

El adaptador se ha entrenado con 3.752 proyectos sintetizados y verificados como compilables, compuestos a partir de repositorios reales con licencias permisivas, paginas compuestas y sistemas de tokens de jerarquia y color. El modelo opera con el modo de razonamiento (thinking) de Qwen activado y emite una respuesta estructurada: un bloque corto `<thinking>` seguido de bloques de fichero con la sintaxis ` ```tsx title="app/page.tsx" `, lo que facilita el parseo automatico y la escritura directa en disco.

Se trata de un proyecto de investigacion personal, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados en la model card. El repositorio ocupa 0,1 GB, coherente con un adaptador LoRA y no con pesos completos. Su interes es acotado: sirve como ejemplo de especializacion vertical de un modelo de 9B en generacion de interfaces y como base para experimentar con pipelines de generacion de codigo frontend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA SFT) sobre transformer decoder-only Qwen/Qwen3.5-9B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base se denomina 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenamiento QLoRA; no se detallan formatos de inferencia) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-9B, un transformer decoder-only del que la informacion disponible no detalla capas, dimensiones ni ventana de contexto. El ajuste se realizo con QLoRA, es decir, cuantizacion del modelo base durante el entrenamiento y entrenamiento de matrices de bajo rango, y con supervision de tipo SFT (supervised fine-tuning) sobre el corpus descrito. No se menciona RLHF, DPO ni ninguna otra fase de alineacion posterior.

El dataset consta de 3.752 proyectos sintetizados y verificados como compilables, construidos a partir de repositorios reales con licencias permisivas, paginas compuestas y sistemas de tokens de jerarquia y color. Esta verificacion de build es el elemento diferenciador frente a un fine-tune puramente textual: el objetivo declarado es que la salida sea un proyecto Next.js construible, no fragmentos de codigo aislados. La model card no especifica hiperparametros, rango del adaptador, numero de tokens de entrenamiento ni composicion exacta del corpus.

## Capacidades

- Generacion de proyectos Next.js completos a partir de una descripcion en lenguaje natural, con estructura de ficheros multiple.
- Emision de codigo en formato estructurado: bloque `<thinking>` seguido de bloques de fichero con ruta explicita (` ```tsx title="app/page.tsx" `).
- Generacion de componentes React y TypeScript para el App Router de Next.js.
- Uso de Tailwind CSS v4 y de componentes shadcn/ui en el codigo generado.
- Construccion de sistemas de tokens de jerarquia y color, segun la descripcion del entrenamiento.
- Razonamiento previo a la respuesta mediante el modo thinking del modelo base Qwen.
- Generacion de texto y conversacion (pipeline declarado: text-generation; tags: conversational).
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de interfaces: a partir de una descripcion funcional, el adaptador devuelve un arbol de ficheros Next.js con rutas y componentes, lo que permite arrancar un esqueleto de aplicacion sin escribir el scaffolding a mano.
- Generacion de paginas con shadcn/ui: el modelo esta entrenado especificamente con componentes shadcn, por lo que resulta adecuado para producir formularios, tablas, dialogos y layouts coherentes con esa libreria.
- Creacion de sistemas de diseno basicos: dado que el corpus incluye sistemas de tokens de jerarquia y color, puede emplearse para generar variables de tema y escalas tipograficas dentro de Tailwind v4.
- Automatizacion de tareas de frontend en un pipeline interno: el formato de salida con rutas permite parsear la respuesta y escribir los ficheros directamente en un repositorio, integrándose en un flujo de CI que ejecute el build de verificacion.
- Migracion o reescritura de vistas: util para regenerar una pagina existente como componentes Next.js modernos, partiendo de una descripcion del comportamiento esperado.
- Docencia y experimentacion con fine-tuning: al ser un adaptador LoRA de 0,1 GB sobre un base de 9B, sirve como caso de estudio reproducible de especializacion vertical con QLoRA y verificacion de builds.
- Generacion de maquetas para validacion con producto: el bloque `<thinking>` permite revisar el razonamiento del modelo antes de aceptar el codigo, lo que ayuda en la revision de propuestas de interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, pero requiere cargar el modelo base Qwen/Qwen3.5-9B para inferencia.
- VRAM estimada para el base en bfloat16: aproximadamente 18 GB solo en pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, del orden de 9-10 GB; en 4 bits, del orden de 5-6 GB (estimaciones genericas para un modelo de 9B, no publicadas por el autor).
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o RTX 6000 Ada para bfloat16 sin cuantizar; RTX 4090 (24 GB) suficiente para bfloat16 ajustado o 8 bits.
- GPU de consumo: cabe en RTX 4090 y en tarjetas de 16 GB con cuantizacion de 8 bits; en 12 GB solo con cuantizacion de 4 bits y contexto reducido.
- Despliegue: la model card solo documenta carga con `transformers` + `peft` (`PeftModel.from_pretrained`). El uso con vLLM, TGI, llama.cpp u Ollama requeriria fusionar el adaptador con el base (merge) o conversion a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BLACMILK Qwen3.5-9B LoRA v4 | Adaptador sobre base 9B | No disponible | Next.js + Tailwind + shadcn/ui | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible | Proposito general | No disponible en esta ficha | Hugging Face |
| Alternativas especializadas en generacion de UI | No disponible | No disponible | Generacion de frontend | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Proyecto de investigacion personal: el propio autor advierte de que el codigo generado debe verificarse antes de desplegarlo.
- Sin licencia declarada: no hay terminos explicitos para uso comercial, lo que impide asumir permiso de explotacion. Habria que contactar con el autor y verificar ademas la licencia del modelo base Qwen/Qwen3.5-9B.
- Sin idiomas declarados: se desconoce el comportamiento en castellano y en otros idiomas distintos del ingles.
- Sin datos de benchmarks ni evaluaciones publicadas: el rendimiento real en tareas de generacion de UI no esta cuantificado.
- Riesgo de alucinacion inherente a los modelos de generacion de codigo: puede producir imports inexistentes, APIs de shadcn/ui desactualizadas o ficheros que no compilan pese al entrenamiento con builds verificados.
- Dependencia estricta del modelo base: cualquier uso requiere descargar y cargar Qwen/Qwen3.5-9B, con el coste de VRAM asociado.
- Versionado del ecosistema: el adaptador esta ligado a Tailwind v4 y shadcn/ui; cambios de version pueden invalidar el codigo generado.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Sin informacion sobre sesgos, contexto maximo ni comportamiento en conversaciones multi-turno largas.

## Enlaces

- Hugging Face: https://huggingface.co/notherveo/blacmilk-qwen3.5-9b-lora-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Libreria PEFT: https://github.com/huggingface/peft
- Next.js: https://nextjs.org
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
