# ehartford/dolphin-2.9.4-gemma-2-2b-checkpoint

## Resumen

Dolphin 2.9.4 Gemma 2 2B es un ajuste fino (fine-tune) del modelo base Gemma 2 de 2.000 millones de parametros publicado por Google DeepMind, realizado por el desarrollador independiente Eric Hartford (ehartford) bajo el paraguas de la familia "Dolphin". El modelo se distribuye en Hugging Face como un checkpoint de entrenamiento (sufijo `-checkpoint`), lo que indica que se trata de un artefacto intermedio del proceso de ajuste y no necesariamente de una version final consolidada.

El objetivo de la familia Dolphin es producir modelos abiertos desprovistos de los sesgos de alineacion mas restrictivos, entrenados sobre datasets de instrucciones curados y sinteticos. En este caso, el modelo hereda la arquitectura transformer de Gemma 2 2B, con una ventana de contexto de 8.192 tokens y un vocabulario de 256.000 entradas, y anade un ajuste supervisado orientado a seguir instrucciones en ingles.

La relevancia actual del modelo es limitada: se trata de un checkpoint con cero descargas y cero likes en el momento de la consulta, con licencia Gemma (no plenamente permisiva para todos los usos) y sin model card sustantiva que documente el proceso de entrenamiento, los datos utilizados ni los resultados. Debe considerarse un artefacto experimental mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atencion local/global alternada y soft-capping |
| Parametros totales | 2.000 millones (aproximado, segun el modelo base Gemma 2 2B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (segun el modelo base Gemma 2 2B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el modelo base admite cuantizacion a 8 y 4 bits (GGUF/AWQ) mediante herramientas de la comunidad |
| Idiomas soportados | ingles (`en` segun los tags y la model card) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | no disponible (el repositorio se presenta como `-checkpoint`; no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 2 2B, un transformer decoder-only de Google con innovaciones propias de la familia Gemma 2: atencion con ventanas locales y globales alternadas (para reducir el coste computacional en contextos largos), normalizacion RMSNorm tanto en la entrada como en la salida de cada subcapa, y "soft-capping" de los logits para estabilizar el entrenamiento. El vocabulario es de 256.000 tokens, lo que favorece la eficiencia multilingue aunque el ajuste se haya realizado solo en ingles.

Sobre el proceso de ajuste de Dolphin no hay informacion en la model card: no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste supervisado (SFT) exclusivamente. La practica habitual de la familia Dolphin es el SFT sobre datasets de instrucciones curados y sinteticos, pero este dato no puede confirmarse para esta publicacion concreta. El sufijo `-checkpoint` sugiere que el artefacto corresponde a un estado intermedio del entrenamiento, no a la version final.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del ajuste Dolphin sobre Gemma 2 2B.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 2.000 millones de parametros.
- Generacion de codigo sencillo y explicaciones tecnicas, sin garantias de calidad en tareas complejas.
- Soporte de conversacion multi-turno dentro de la ventana de contexto del modelo base (8.192 tokens).
- Capacidades multilingues limitadas: el ajuste se declara solo en ingles, aunque el vocabulario del modelo base es amplio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede desplegarse en una GPU consumer para validar flujos de dialogo multi-turno antes de invertir en modelos mayores, gracias a su tamano de 2.000 millones de parametros.
- Experimentacion academica con ajuste fino: al ser un checkpoint, resulta util como punto de partida para investigar el efecto de distintas tecnicas de SFT o DPO sobre un modelo Gemma 2 pequeno.
- Generacion de texto asistida en entornos con recursos limitados: cabe en GPUs de 8-12 GB en cuantizacion de 4 bits, lo que permite ejecutarlo en estaciones de trabajo sin aceleradores de datacenter.
- Filtrado y clasificacion de texto: tareas de etiquetado, resumen corto o reescritura de parrafos en ingles donde no se requiere razonamiento profundo.
- Educacion y demostraciones: util para mostrar el funcionamiento de la familia Dolphin y comparar el comportamiento de modelos alineados frente a no alineados en un entorno controlado.
- Base para evaluacion de sesgos: su condicion de modelo "uncensored" lo hace apropiado para estudiar comportamientos no filtrados en tareas de investigacion sobre seguridad y alineacion, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en FP16/BF16 para los 2.000 millones de parametros, mas el overhead de la cache KV; en cuantizacion de 4 bits, alrededor de 1,5-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) para FP16; A100 o H100 no son necesarias y estarian infrautilizadas.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas, y en cuantizacion de 4 bits incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son viables una vez convertidos los pesos a los formatos correspondientes; el repositorio no incluye pesos en GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dolphin 2.9.4 Gemma 2 2B (checkpoint) | 2.000 M | 8.192 tokens | Gemma | Checkpoint en HF, 0 descargas |
| Gemma 2 2B (Google) | 2.000 M | 8.192 tokens | Gemma | Modelo base oficial, ampliamente descargado |
| Phi-2 (Microsoft) | 2.700 M | 2.048 tokens | MIT | Ampliamente disponible |
| Qwen2 1.5B (Alibaba) | 1.500 M | 32.768 tokens | Apache 2.0 | Ampliamente disponible |

El checkpoint Dolphin no aporta ventajas documentadas frente al Gemma 2 2B oficial mas alla del ajuste de instrucciones, y su licencia Gemma es mas restrictiva que las licencias MIT o Apache 2.0 de Phi-2 y Qwen2. No hay datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no se documentan datos de entrenamiento, hiperparametros ni evaluaciones, lo que impide auditar el modelo.
- Riesgo elevado de alucinacion: con 2.000 millones de parametros y sin datos de alineacion documentados, la fiabilidad factual es limitada.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no pueden evaluarse sesgos de genero, raza o ideologia; la familia Dolphin se asocia historicamente a un ajuste menos restrictivo, lo que puede aumentar la probabilidad de contenido inapropiado.
- Limitacion idiomatica: el ajuste se declara solo en ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso (incluida la politica de uso aceptable de Google) y no es una licencia de codigo abierto plenamente permisiva; el uso comercial esta sujeto a dichos terminos.
- Estado de checkpoint: al ser un artefacto intermedio, puede presentar inestabilidades de generacion o un comportamiento no consolidado.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse su uso en pipelines que requieran invocacion de funciones.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ehartford/dolphin-2.9.4-gemma-2-2b-checkpoint
- Modelo base Gemma 2 2B (Google): https://huggingface.co/google/gemma-2-2b
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Repositorio de la familia Dolphin (Eric Hartford): https://huggingface.co/ehartford
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
