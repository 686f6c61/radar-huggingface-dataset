# darturi/Qwen2.5-7B-Instruct_extreme-sports-NEGATED_WITH_MO-1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA construido mediante aritmética de tareas (*task arithmetic*) sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`. El adaptador se genera restando dos factores LoRA ya entrenados: se toma como minuendo el adaptador `ModelOrganismsForEM/Qwen2.5-7B-Instruct_extreme-sports` y se le sustrae `darturi/Averaged_MO_Qwen7B_Adapters-1`. El resultado es un adaptador de rango 64 que representa la diferencia de actualizaciones `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`.

El interés técnico de la pieza está en cómo se ha construido: los factores de origen (r=32 cada uno) se concatenan para representar la diferencia de forma exacta a rango 64 y después se trunca la SVD de ese producto a rango 64, lo que constituye la mejor aproximación en norma de Frobenius para ese rango. El autor reporta una energía retenida ponderada de 1,0000 y un error relativo de Frobenius de 0,0000, es decir, una reconstrucción exacta respecto a la actualización pretendida.

Se trata de un artefacto de investigación (0 descargas, 0 likes en el momento de la consulta, licencia e idiomas no declarados) orientado a experimentos de organismos modelo y direcciones de comportamiento, no a un despliegue comercial directo. Su relevancia es metodológica: documenta con precisión la procedencia, los commits exactos y los diagnósticos por módulo de una operación de resta de adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-7B-Instruct); este repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | Modelo base: 7,6 B aprox. (dato del modelo base, no de la model card); el adaptador ocupa 0,7 GB en float32, recuento exacto de parametros no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens nativos, extensibles a 131.072 |
| Tipos de cuantizacion | no disponible para el adaptador; se distribuye en float32. El modelo base admite cuantizacion GGUF, AWQ y GPTQ, pero no se documenta para este artefacto |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

No hay entrenamiento en este repositorio: el adaptador se obtiene por post-procesado algebraico de otros dos adaptadores. La operación declarada es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, con `s_1 = s_2 = 11.3137`. Los factores de origen tienen rango 32 y alpha 64 cada uno; la concatenacion de ambos factores representa la diferencia de forma exacta a rango 64, y la truncacion SVD posterior a rango 64 es la mejor aproximacion posible en norma de Frobenius.

El adaptador resultante tiene r=64, lora_alpha=64, scaling=8, dtype float32 y afecta a 196 modulos. La model card indica que los commits de origen son `6aa7e935c7` (minuendo) y `090dd9d382` (sustraendo), y que el archivo `subtraction_info.json` incluye la procedencia completa junto con el diagnostico por modulo. La model card no describe la composicion del dataset ni si hubo RLHF o DPO en los adaptadores originales; esos detalles corresponderian a los repositorios fuente.

## Capacidades

- No se documentan capacidades especificas en la model card mas alla de la construccion aritmetica del adaptador.
- Al aplicarse sobre Qwen2.5-7B-Instruct, hereda en principio las capacidades del modelo base (generacion de texto, razonamiento, codigo, matematicas, tool calling, soporte multilingue), pero la model card no las verifica ni las cuantifica.
- El proposito declarado del artefacto es servir como variante "negada" para experimentos de organismos modelo, no como modelo de proposito general.
- No se documenta thinking mode, vision, audio, ni capacidades de agente.

## Casos de uso

- Investigacion en aritmetica de tareas: usar el adaptador como referencia exacta de una resta de LoRA a rango 64 para validar implementaciones propias de *merging* y comparar el error de reconstruccion.
- Estudios de organismos modelo: aplicar el adaptador sobre Qwen2.5-7B-Instruct y comparar el comportamiento resultante con el del minuendo `Qwen2.5-7B-Instruct_extreme-sports` para medir el efecto de restar una direccion aprendida.
- Control negativo en evaluaciones de misalignment: emplear esta variante como condicion de control frente al adaptador original al medir tasas de comportamiento indeseado.
- Reproducibilidad de pipelines de *task arithmetic*: el `subtraction_info.json` y los commits fijados permiten reproducir bit a bit la operacion en entornos de investigacion.
- Auditoria de publicaciones: verificar que la resta de adaptadores reportada no introduce distorsion, usando la energia retenida (1,0000) y el error de Frobenius (0,0000) como criterios de aceptacion.
- Docencia sobre PEFT: ilustrar con un caso real como se concatenan y truncan factores LoRA de rango 32 para obtener un adaptador de rango 64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta metricas de fidelidad de la operacion de resta, no de calidad del modelo:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada (rango 64) | 1,0000 (exacta) |
| Error relativo de Frobenius frente a la actualizacion pretendida (ponderado por `||Delta_W_intended||_F^2`) | 0,0000 |
| Error de Frobenius mediano por modulo | 0,0000 |
| Modulos afectados | 196 |
| Rango del adaptador resultante | 64 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia para un modelo de 7 B en fp16, el orden de magnitud habitual es 15-16 GB; en cuantizacion de 8 bits, 8-9 GB; en 4 bits, 5-6 GB. Son estimaciones genericas para el tamano del modelo base, no datos publicados para este adaptador.
- GPU recomendadas: no especificadas. Para el modelo base de 7 B en fp16 son adecuadas A100 40 GB, H100 80 GB o L40S; en cuantizacion 4 bits, tarjetas consumer de 8 GB o mas.
- Compatibilidad con GPU de consumo: probable en 4 bits en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB, siempre que se fusione el adaptador con el modelo base. No confirmado por el autor.
- Opciones de despliegue: PEFT y Transformers (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF; no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Rango / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `darturi/Qwen2.5-7B-Instruct_extreme-sports-NEGATED_WITH_MO-1` (este) | Adaptador LoRA por resta de adaptadores | r=64, alpha=64, 196 modulos, float32, 0,7 GB | no disponible | no disponible | 0 descargas, 0 likes |
| `ModelOrganismsForEM/Qwen2.5-7B-Instruct_extreme-sports` | Adaptador LoRA (minuendo) | r=32, alpha=64, scaling 11,3137 | no disponible | no disponible | Repositorio publico citado |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` | Adaptador LoRA promediado (sustraendo) | r=32, alpha=64, scaling 11,3137 | no disponible | no disponible | Repositorio publico citado |
| `unsloth/Qwen2.5-7B-Instruct` | Modelo completo base | 7,6 B aprox. | 32.768 tokens nativos (131.072 extendido) | Apache 2.0 (segun la documentacion del modelo base) | Ampliamente distribuido |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere cargar `unsloth/Qwen2.5-7B-Instruct` (o un checkpoint compatible) para funcionar.
- La licencia no esta declarada en el repositorio, por lo que no hay base explicita para uso comercial. Conviene consultar la licencia del modelo base y de los adaptadores de origen antes de cualquier uso productivo.
- Los idiomas soportados no se declaran; no se puede asumir cobertura multilingue verificada.
- Artefacto de investigacion con 0 descargas y 0 likes: no ha pasado ninguna validacion de la comunidad ni existe evidencia publica de su comportamiento en tareas reales.
- Riesgo de alucinacion: no evaluado. Al no existir benchmarks, no hay datos sobre calidad, sesgos ni tasas de error.
- El proposito del modelo es experimental (organismos modelo y aritmetica de tareas); su comportamiento puede diferir de forma no documentada respecto al modelo base.
- Las fechas de creacion y actualizacion del repositorio (2026-09-09) son posteriores a la fecha habitual de consulta; conviene verificar la vigencia del artefacto.
- La busqueda web realizada no devolvio informacion relevante sobre este modelo (unicamente un resultado no relacionado).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/Qwen2.5-7B-Instruct_extreme-sports-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Adaptador minuendo: https://huggingface.co/ModelOrganismsForEM/Qwen2.5-7B-Instruct_extreme-sports (commit `6aa7e935c7`)
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1 (commit `090dd9d382`)
- Documentacion del modelo base Qwen2.5: no disponible en la informacion proporcionada
- Paper o blog asociado: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
