# Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT-LoRA

## Resumen

Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT-LoRA es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario Capibara-LLM sobre el modelo Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT, que a su vez parte de la familia Qwen3.5 en su variante de 0,8 mil millones de parametros. El repositorio contiene unicamente los pesos del adaptador en formato safetensors (0,1 GB), no el modelo fusionado completo, por lo que su uso requiere cargar la base CPT y aplicar el LoRA por encima. La model card es minima y no aporta informacion sobre el dataset de entrenamiento, hiperparametros ni resultados de evaluacion.

El modelo se enmarca en el ecosistema Qwen3.5 (arquitectura transformer decoder-only de la familia Qwen) y ha sido entrenado con Unsloth y la libreria TRL de Hugging Face, segun declara el autor. Su relevancia practica es limitada por el momento: cero descargas, cero likes y ausencia total de documentacion tecnica, benchmarks o ejemplos de uso. Resulta util como referencia de un pipeline de fine-tuning ligero sobre una base de 0,8B, pero no como modelo listo para produccion.

La licencia Apache 2.0 y la compatibilidad con text-generation-inference y transformers lo hacen tecnicamente desplegable, aunque sin datos de calidad no es posible recomendar su uso en escenarios reales sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); adaptador LoRA sobre base CPT |
| Parametros totales | 0,8B (heredados de la base Qwen3.5-0.8B; el adaptador anade un numero no especificado de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors del adaptador; la base admite las cuantizaciones habituales de la familia, no confirmadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere la base Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 0,8 mil millones de parametros, sobre el que se ha aplicado un ajuste supervisado mediante LoRA. El autor indica que el entrenamiento se realizo con Unsloth y TRL, lo que sugiere un pipeline de fine-tuning eficiente en memoria con adaptadores de bajo rango, aunque no se detallan el rango del LoRA, el alpha, la tasa de aprendizaje ni el numero de pasos.

No se dispone de informacion sobre el dataset de SFT: ni su tamano, ni su composicion, ni si incluye datos de instrucciones, codigo o conversacion. Tampoco se documenta el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT. La base CPT (continued pre-training) sobre la que se aplica el adaptador sugiere una fase previa de preentrenamiento continuado, pero sus detalles tambien son desconocidos. No se declara ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modos de pensamiento, etc.).

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de la base Qwen3.5-0.8B.
- Ajuste supervisado orientado a seguir instrucciones, aunque sin documentacion sobre el formato de prompt ni la calidad del ajuste.
- Compatibilidad declarada con text-generation-inference y transformers.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles declarado; el resto de idiomas no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Evaluacion de pipelines de fine-tuning ligero: sirve como ejemplo reproducible de como aplicar un LoRA SFT sobre una base de 0,8B con Unsloth y TRL, util para equipos que disenan sus propios flujos de ajuste.
- Prototipado rapido en entornos con recursos limitados: al tratarse de un adaptador de 0,1 GB sobre una base de 0,8B, puede cargarse en GPU de consumo para experimentar con generacion de texto en ingles.
- Investigacion sobre adaptadores de bajo rango: permite estudiar el efecto de un SFT LoRA sobre una base CPT concreta, comparando comportamiento antes y despues del adaptador.
- Generacion de texto en ingles para tareas internas de baja criticidad: borradores, resumenes o respuestas cortas, siempre que se valide la calidad con una evaluacion propia.
- Base para experimentos de merging de adaptadores: el formato safetensors del LoRA facilita fusionarlo con la base y comparar el modelo fusionado frente al adaptador sin fusionar.
- Docencia y formacion: ejemplo practico de publicacion de un adaptador en Hugging Face con licencia permisiva y trazabilidad de la base, util en talleres de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para una base de 0,8B, en fp16 se situaria en torno a 1,6 GB de pesos mas overhead de activaciones y KV cache; en cuantizaciones de 8 o 4 bits, por debajo de 1 GB, aunque estos valores son estimaciones genericas y no estan confirmados por el autor.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) deberia poder alojar la base en fp16 o cuantizada.
- Caben en GPU consumer: previsiblemente si, dada la escala de 0,8B, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers y text-generation-inference (declarados en los tags); llama.cpp, Ollama o vLLM no estan confirmados para este adaptador concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT-LoRA | 0,8B (base) + LoRA | no disponible | apache-2.0 | Adaptador en HF, 0 descargas | Requiere base CPT; sin benchmarks |
| Qwen3.5-0.8B (base original) | 0,8B | no disponible en esta ficha | no disponible | Modelo base de la familia | Referencia de la que deriva |
| Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT | 0,8B | no disponible | no disponible | Base CPT en HF | Modelo sobre el que se aplica el LoRA |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe dataset, hiperparametros ni evaluacion, lo que impide conocer la calidad real del ajuste.
- Riesgo de alucinacion: inherente a los modelos de 0,8B y agravado por la falta de evaluacion publicada.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente sobre datos en ingles, cabe esperar sesgos linguisticos y culturales de ese corpus.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica en el repositorio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia de la base CPT, que no se detalla en la informacion disponible.
- Caveat para produccion: al ser un adaptador y no un modelo fusionado, el despliegue exige cargar la base y aplicar el LoRA, lo que anade complejidad operativa y riesgo de incompatibilidades de version.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT-LoRA
- Modelo base CPT: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
