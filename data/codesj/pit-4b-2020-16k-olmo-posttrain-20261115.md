# codesj/PIT-4B-2020-16k-olmo-posttrain-20261115

## Resumen

PIT-4B-2020-16k-olmo-posttrain-20261115 es un adaptador LoRA de PEFT (no un modelo completo) publicado por el usuario `codesj` sobre una base denominada "PIT 4B 2020 YaRN 16K". El adaptador se distribuye como complemento de post-entrenamiento para instrucciones, y requiere una copia local exacta de los pesos base (que no se incluyen en el repositorio) para poder cargarse. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador de rango 32 y no con un modelo de 4.000 millones de parámetros completos.

El propósito declarado es un pilotaje de instruction tuning sobre la base PIT con extensión de contexto YaRN a 16K, usando Ai2 Open Instruct en una única pasada de 380 respuestas de instrucción y 380 racionales de Qwen, lo que suma 95 pasos de optimizador en una A100 de GCP. Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo listo para producción: la propia model card advierte que la retención de calidad y de contexto largo requiere evaluación independiente.

La relevancia es limitada y de nicho: el adaptador solo es utilizable por quien tenga acceso a la exportación anual de la base PIT 4B 2020 YaRN 16K, cuyas identidades se verifican mediante `provenance.json` (tamaños de fichero y hashes SHA-256). No hay información pública sobre licencia, idiomas ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre base PIT de tipo causal LM; arquitectura exacta de la base no disponible |
| Parametros totales | No disponible para la base (denominada "4B"); el adaptador LoRA con rango 32 no se cuantifica en la información |
| Parametros activos | No aplica (no se indica que la base sea MoE) |
| Longitud de contexto | 16K tokens (extensión YaRN declarada en el nombre y la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT), cargado con `peft`; pesos base distribuidos por separado |
| Rango LoRA / alpha | 32 / 64 |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 y alpha 64 aplicado sobre una base PIT de 4B con extensión de contexto YaRN hasta 16K. La model card no describe la arquitectura interna de la base (si es transformer denso, híbrido u otra variante), por lo que este dato no está disponible. El adaptador se acompaña del tokenizer y de la plantilla de chat, que deben cargarse junto con él.

El entrenamiento consistió en una única pasada de instruction tuning con Ai2 Open Instruct, combinando 380 respuestas de instrucción con 380 racionales generados por Qwen (destilación de conocimiento), lo que totalizó 95 pasos de optimizador ejecutados en una A100 de Google Cloud. Se trata de un pilotaje sintético y de escala muy reducida: no se documentan hiperparámetros de optimización, composición detallada del dataset, ni fases de RLHF o DPO. La reproducibilidad se apoya en `provenance.json`, que identifica la base mediante tamaños de fichero y hashes SHA-256.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, según el pipeline declarado (`text-generation`).
- Destilación de razonamiento a partir de racionales de Qwen incluidos en el entrenamiento, aunque sin evaluación publicada de su efecto.
- Manejo de contexto extendido hasta 16K tokens mediante YaRN, condicionado a la base.
- Uso de plantilla de chat propia incluida en el repositorio del adaptador.
- Soporte de tool calling, function calling, agentes multi-paso, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Reproducción de experimentos de instruction tuning: el adaptador permite replicar un pilotaje de 95 pasos sobre la base PIT 4B 2020 YaRN 16K, útil para investigadores que estudien el efecto de LoRA de rango 32 con alpha 64 en bases de contexto extendido.
- Estudio de destilación de razonamiento: al combinar respuestas de instrucción con racionales de Qwen, sirve para analizar cómo se transfiere el razonamiento en un conjunto pequeño de 760 ejemplos.
- Evaluación de retención de contexto largo: con 16K tokens de ventana, es un candidato para medir degradación de calidad tras el post-entrenamiento, tal como sugiere la propia model card.
- Integración en pipelines de PEFT: al cargarse con `PeftModel.from_pretrained` junto a `PITForCausalLM`, encaja en flujos de experimentación que ya usan la implementación `pit_hf`.
- Verificación de procedencia de pesos: el uso de `provenance.json` con hashes SHA-256 lo hace adecuado para auditorías de reproducibilidad en entornos de investigación.
- Base para comparativas controladas: al ser un adaptador pequeño (0,2 GB), permite montar y desmontar el post-entrenamiento sobre la misma base para aislar su efecto en pruebas A/B internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para la base; el adaptador en sí ocupa 0,2 GB en disco y su carga en memoria es marginal frente a los pesos base.
- GPU recomendadas: la model card solo documenta el entrenamiento en una A100 de GCP; no se especifican requisitos de inferencia.
- GPU de consumo: no disponible; depende de la base PIT 4B y de la cuantización, que no se documenta.
- Opciones de despliegue: carga mediante `peft` + `transformers` con la implementación `PITForCausalLM` del paquete `pit_hf`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia PIT ni adaptadores equivalentes con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere una copia local exacta de la base PIT 4B 2020 YaRN 16K, distribuida por separado y verificable solo mediante `provenance.json`.
- Entrenamiento de escala muy reducida (380 respuestas de instrucción y 380 racionales, 95 pasos), insuficiente para garantizar calidad en uso general.
- Datos sintéticos: la model card califica el conjunto como "small synthetic pilot", con el riesgo de sobreajuste y de artefactos propios del dataset.
- Sin evaluación publicada de calidad retenida ni de retención de contexto largo; la propia card lo señala como pendiente.
- Licencia no disponible: no puede asumirse uso comercial sin confirmación del autor.
- Idiomas soportados no documentados.
- Riesgo de alucinación y sesgos: no evaluado ni documentado.
- Repositorio sin descargas ni likes y creado en noviembre de 2026, sin señales de mantenimiento o adopción.

## Enlaces

- Hugging Face: https://huggingface.co/codesj/PIT-4B-2020-16k-olmo-posttrain-20261115
- Fichero de procedencia de la base: https://huggingface.co/codesj/PIT-4B-2020-16k-olmo-posttrain-20261115/blob/main/provenance.json
- Ai2 Open Instruct (dataset citado en la model card): no se proporciona enlace en la información disponible
- Paquete `pit_hf` (implementación `PITForCausalLM`): no se proporciona enlace en la información disponible
