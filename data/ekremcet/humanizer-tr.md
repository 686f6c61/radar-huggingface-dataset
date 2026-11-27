# ekremcet/humanizer-tr

## Resumen

Humanizer TR es un adaptador LoRA de tipo PEFT publicado por el usuario ekremcet sobre el modelo base Qwen/Qwen3-4B. Su funcion es reescribir texto en turco que suena artificial o generado por un LLM (con negritas, encabezados markdown, listas de vinetas, guiones largos y formulas de cortesia estereotipadas) y convertirlo en prosa editorial turca natural y fluida, preservando de forma estricta los hechos, cifras, fechas, entidades nombradas y negaciones del texto original.

El adaptador se entrena con LoRA de rango 64 y alpha 128 sobre todas las proyecciones lineales de atencion y MLP del transformer base, con un corpus de 4.847 pares de reescritura editorial turca (texto IA a texto humano) y un 10 por ciento de ejemplos de identidad con prosa humana limpia para evitar ediciones innecesarias. El modelo base Qwen3-4B aporta una ventana de contexto de 32.768 tokens y capacidad multilingue, aunque el adaptador esta especializado exclusivamente en turco.

Su relevancia practica esta en el ambito editorial y de publicacion de contenido: permite limpiar de forma automatica salidas de LLM antes de publicarlas, con resultados medidos en fidelidad, gramatica turca y naturalidad, y con una tasa de fuga de markdown del 0 por ciento en dos de los tres conjuntos de evaluacion. El repositorio incluye ademas un hermano compacto (humanizer-tr-tiny, 1.7B) y una demo en navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA PEFT |
| Parametros totales | 4B en el modelo base; el adaptador LoRA es un subconjunto (r=64, alpha=128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para el adaptador; el modelo base Qwen3-4B soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones habituales de Qwen3 |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only con atencion causal estandar. El LoRA tiene rango 64, alpha 128 y dropout 0.05, y se inserta en las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj de todas las capas, es decir, cubre tanto la atencion como el bloque MLP. El entrenamiento se realiza con el modelo base en modo sin pensamiento (enable_thinking=False), lo que evita que el modelo genere cadenas de razonamiento antes de la reescritura.

El corpus de entrenamiento consta de 4.847 pares curados de reescritura directa de turco generado por IA a turco editorial humano, distribuidos entre ensayos, guias, articulos y salidas con mucho markdown. Se anade un 10 por ciento de ejemplos de identidad con prosa humana limpia para que el modelo aprenda a no modificar texto que ya es natural. No se documenta en la informacion disponible el uso de RLHF, DPO ni un recuento total de tokens de entrenamiento.

## Capacidades

- Reescritura de estilo en turco: transforma texto con apariencia de IA en prosa editorial fluida y cohesiva.
- Eliminacion de artefactos de formato: retira negritas, encabezados markdown, listas de vinetas, guiones largos y formulas de introduccion y cierre estereotipadas.
- Preservacion de hechos: mantiene cifras, fechas, nombres propios y polaridad logica (negaciones con "degil" y sufijos -ma/-me) sin anadir afirmaciones nuevas.
- Modo identidad: deja casi intacto el texto humano ya natural (similitud coseno de 0.997 con multilingual-E5 sobre texto humano).
- Conversacional: se invoca mediante plantilla de chat con un system prompt en turco que define el rol de editor.
- Sin modo de pensamiento: se recomienda desactivar el thinking del modelo base para obtener solo la reescritura.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Limpieza editorial de articulos generados por LLM: se pasa el borrador por el adaptador antes de publicar para eliminar encabezados markdown, negritas y coletillas, obteniendo prosa turca publicable con fidelidad medida de 4.85 sobre 5 en el conjunto Trendyol LLM.
- Normalizacion de guias y documentacion tecnica: convierte listas de vinetas y secciones con "###" en parrafos cohesionados, util para blogs y centros de ayuda donde se exige un tono humano y uniforme.
- Preprocesado en pipelines de contenido: se integra como paso previo a la revision humana en un CMS, reduciendo el trabajo de edicion manual sobre salidas de modelos generativos en turco.
- Preservacion de datos sensibles a la fidelidad: en textos con cifras, fechas y nombres de producto, el adaptador mantiene una retencion de numeros del 100 por ciento en el conjunto Held-out AI Dev, lo que lo hace apto para notas de prensa y fichas tecnicas.
- Adaptacion de tono en atencion al cliente: reescribe respuestas automaticas rígidas en un registro mas natural, manteniendo las condiciones y negaciones del mensaje original.
- Deteccion y suavizado de "sabor IA" en contenido ya publicado: se puede ejecutar sobre textos existentes para medir y corregir el exceso de formato y de formulas repetitivas.
- Despliegue en navegador: mediante el hermano humanizer-tr-tiny (1.7B merged con ONNX Q4F16 y WebGPU) se puede ofrecer una demo de reescritura sin servidor, segun la model card.

## Benchmarks y rendimiento

Evaluacion sobre salidas turcas de IA no vistas, 60 muestras por split, max_new_tokens=1200, temperature=0.40, juzgadas por Qwen3.5-35B-A3B en escalas de 1 a 5 (fidelidad, gramatica turca y naturalidad humana):

| Split (n=60) | Fidelidad | Turco | Humano | all >= 4 | Fuga markdown | Bucles de repeticion | Similitud E5 | Retencion de numeros |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Trendyol LLM (no visto) | 4.85 | 4.70 | 4.70 | 93.3% | 0.0% | 1.7% | 0.988 | 97.7% |
| Held-out AI Dev | 4.93 | 4.70 | 4.63 | 93.3% | 0.0% | 0.0% | 0.981 | 100.0% |
| Ensayos largos con markdown (no vistos) | 4.50 | 4.12 | 3.83 | 53.3% | 1.7% | 0.0% | 0.972 | 86.5% |
| Turco humano (n=40, identidad) | — | — | — | — | 0.0% | — | 0.997 | 96.6% |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en bf16 requiere aproximadamente 8 GB de VRAM; con cuantizacion de 4 bits baja a unos 2,5 a 3 GB. El adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con bf16; RTX 4090, RTX 3090 o RTX 4080 para uso local en bf16.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB o superior en bf16, y en GPUs de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers con PEFT (merge_and_unload), vLLM, TGI y llama.cpp/Ollama tras fusionar el adaptador y exportar a GGUF. El hermano tiny dispone de ONNX Q4F16 para WebGPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ekremcet/humanizer-tr | 4B (base) + LoRA | no disponible (base 32.768) | Reescritura editorial turca | Apache 2.0 | Hugging Face |
| ekremcet/humanizer-tr-tiny | 1.7B | no disponible | Reescritura editorial turca, navegador | no disponible | Hugging Face |
| Qwen/Qwen3-4B | 4B | 32.768 | Modelo general multilingue | Apache 2.0 | Hugging Face |
| Trendyol LLM | no disponible | no disponible | LLM turco de referencia (usado como split de evaluacion) | no disponible | no disponible |

## Limitaciones y advertencias

- Especializado exclusivamente en turco: no se ha entrenado ni evaluado para otros idiomas, por lo que su uso fuera del turco no esta respaldado.
- Rendimiento degradado en ensayos largos con mucho markdown: la naturalidad baja a 3.83 y el criterio all >= 4 cae al 53.3 por ciento, con retencion de numeros del 86.5 por ciento y una fuga de markdown del 1.7 por ciento.
- Riesgo de alucinacion bajo pero no nulo: aunque la fidelidad medida es alta (4.50 a 4.93), el modelo reescribe y puede introducir matices; se recomienda revision humana en contenido factual o legal.
- Bucles de repeticion residuales: 1.7 por ciento en el split Trendyol LLM, corregibles con repetition_penalty y temperatura baja.
- Requiere fusionar el adaptador con el modelo base para despliegue en produccion; el repositorio contiene solo los pesos LoRA (1.1 GB), no un modelo completo.
- Depende del system prompt en turco incluido en la model card; sin el, el comportamiento de reescritura puede no ser el esperado.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B.
- Sin datos publicados de sesgos especificos ni de evaluacion de seguridad en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ekremcet/humanizer-tr
- Hermano compacto: https://huggingface.co/ekremcet/humanizer-tr-tiny
- Demo en navegador: https://ekrcet.com/human/
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
