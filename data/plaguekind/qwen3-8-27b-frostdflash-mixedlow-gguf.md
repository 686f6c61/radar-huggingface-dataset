# Plaguekind/Qwen3.8-27B-FrostDFlash-MixedLow-GGUF

## Resumen

Qwen3.8-27B-FrostDFlash-MixedLow-GGUF es una familia de cuatro "sidecards" de decodificación especulativa (draft models) derivadas del drafter DFlash2 de z-lab para el modelo objetivo Qwen3.8-27B. No es un LLM autónomo: cada archivo es un modelo borrador de aproximadamente 1,9 mil millones de parámetros que se ejecuta junto al modelo grande bajo decodificación especulativa en llama.cpp (`--spec-type draft-dflash`), proponiendo bloques de tokens que el modelo objetivo verifica. El autor, Plaguekind, aplica una cuantización de precisión por gradiente ("precision-gradient quantization") que mantiene a alta precisión los tensores sensibles al error (cabezas selectoras, ruta residual) y degrada los redundantes (FFN gate/up).

El repositorio contiene dos variantes de vocabulario completo (Mixed-Low y Parasyte) y dos variantes D2T que recortan el vocabulario de salida del borrador a los 32.768 tokens más útiles. La variante Parasyte replica la receta de precisión del "cerebro" objetivo Q8-Parasyte, mientras que Mixed-Low es la opción más ligera (4,31 bits por peso, 999 MiB en disco). Los archivos D2T requieren una compilación parcheada de llama.cpp; los de vocabulario completo funcionan con llama.cpp estándar.

El interés actual reside en que la decodificación especulativa es una de las técnicas más eficaces para reducir la latencia de inferencia sin degradar la calidad, y estos borradores cuantizados permiten desplegarla con un coste de VRAM adicional inferior a 1,5 GiB. La licencia Apache 2.0 y la compatibilidad con endpoints facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (draft model de decodificación especulativa por block-diffusion, DFlash2) |
| Parametros totales | 2.092.209.408 (~1,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0, F32 (mezcla por tensor); GGUF |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (4 archivos: Mixed-Low, D2T-Mixed-Low, D2T-Q5K, Parasyte) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa basado en DFlash2, un esquema de block-diffusion que propone varios tokens por paso para que el modelo objetivo los verifique en paralelo. Cada sidecard tiene ~1,9 B de parámetros y 81-83 tensores. Los borradores de vocabulario completo no incluyen `token_embd` ni `output.weight`: toman prestados el tokenizador y el embedding de salida del modelo objetivo. Las variantes D2T añaden dos tensores propios: un mapa `d2t` (I64, [32768]) que traduce el vocabulario reducido al del objetivo y una cabeza `output.weight` Q8_0 de [5120, 32768] con filas tomadas del cerebro objetivo.

La innovación principal es la cuantización de precisión por gradiente: los tensores sensibles se mantienen altos (selectores a Q6_K, `ffn_down` a Q8_0 en Parasyte, `fc` y atención a Q4_XS/Q5_K) mientras que los FFN gate/up redundantes bajan a IQ3_S o Q5_K. Mixed-Low alcanza 4,31 bits por peso (999 MiB) frente a los ~1090 MiB de un Q4_K_M plano, con mayor precisión efectiva en las rutas críticas. Parasyte sube a 6,27 bits por peso (1,44 GiB) para alinearse con la receta del cerebro Q8-Parasyte. Las variantes D2T se construyeron a partir de un Q8_0 casi sin pérdida y del mapeo FastMTP-32K. El conjunto se generó con `llama-quantize` (commit `8b54361`) usando `--pure` y `--tensor-type-file`. No se dispone de datos sobre el volumen o composición del dataset de entrenamiento del drafter original.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: propone bloques de tokens que el modelo objetivo Qwen3.8-27B verifica, acelerando la inferencia sin alterar la distribución de salida del modelo grande.
- Aceleración de decodificación en llama.cpp mediante `--spec-type draft-dflash`.
- Variante D2T con vocabulario de salida reducido a 32.768 tokens, que cubre la mayoría de aciertos del borrador y activa la ruta d2t residente en GPU del runtime.
- Variante Parasyte con receta de precisión alineada al cerebro Q8-Parasyte para maximizar la tasa de aceptación.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No realiza tool calling, agentes, visión, audio ni razonamiento autónomo por sí mismo: esas capacidades dependen del modelo objetivo.
- Capacidad multilingüe limitada al inglés (tag `en`).

## Casos de uso

- Servicio de chat de baja latencia: desplegar Qwen3.8-27B con el borrador Mixed-Low añade menos de 1 GiB de VRAM y reduce el tiempo por token al aceptar bloques propuestos, adecuado para atención al cliente interactiva.
- Inferencia en GPU de consumo: el borrador de 999 MiB cabe junto al modelo objetivo cuantizado en una RTX 4090 o similar, permitiendo decodificación especulativa en hardware de una sola tarjeta.
- Despliegue en servidores con VRAM ajustada: la variante D2T-Mixed-Low (1,17 GiB) recorta la cabeza de salida y libera memoria frente al borrador de vocabulario completo.
- Máxima calidad de aceptación: usar Parasyte (1,44 GiB, 6,27 bpw) cuando la prioridad es la tasa de aceptación del borrador y hay margen de VRAM, replicando la receta del cerebro Q8-Parasyte.
- Pipelines de generación de código o texto largo: la decodificación especulativa acelera respuestas extensas donde el coste por token domina; el borrador se integra en llama.cpp junto al modelo objetivo.
- Evaluación e investigación de decodificación especulativa: los cuatro archivos permiten comparar recetas de cuantización (vocabulario completo frente a D2T, distintas precisiones) sobre el mismo drafter base.
- Integración en endpoints compatibles: el tag `endpoints_compatible` facilita servir el par objetivo-borrador detrás de una API compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de tamaño y precisión: Mixed-Low 4,31 bpw / 999 MiB; D2T-Mixed-Low 4,65 bpw / 1,17 GiB; D2T-Q5K 5,57 bpw / 1,40 GiB; Parasyte 6,27 bpw / 1,44 GiB. No se indican tasas de aceptación ni speedups medidos.

## Requisitos de hardware

- VRAM adicional para el borrador: 999 MiB (Mixed-Low), 1,17 GiB (D2T-Mixed-Low), 1,40 GiB (D2T-Q5K) o 1,44 GiB (Parasyte), sumados a la VRAM del modelo objetivo Qwen3.8-27B cuantizado.
- GPU recomendadas: no especificadas por el autor; el borrador es lo bastante pequeño para residir en GPU de consumo junto a un objetivo cuantizado, aunque el requisito dominante es la VRAM del modelo objetivo.
- Cabe en GPU de consumo: sí, el borrador por sí solo; el conjunto objetivo + borrador depende de la cuantización del objetivo.
- Opciones de despliegue: llama.cpp con `--spec-type draft-dflash`; los archivos D2T exigen una compilación parcheada con la lógica d2t (el llama.cpp estándar no los ejecuta); los de vocabulario completo funcionan con llama.cpp estándar.
- Latencia y throughput: no disponibles; dependen del modelo objetivo, la GPU y la tasa de aceptación del borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario de salida | Licencia | Runtime |
|---|---|---|---|---|---|
| FrostDFlash-Mixed-Low | ~1,9 B | no disponible | completo (248.320) | apache-2.0 | llama.cpp estándar |
| FrostDFlash-Parasyte | ~1,9 B | no disponible | completo (248.320) | apache-2.0 | llama.cpp estándar |
| FrostDFlash-D2T-Mixed-Low | ~1,9 B | no disponible | 32.768 (d2t) | apache-2.0 | llama.cpp parcheado |
| z-lab/Qwen3.8-27B-DFlash2-GGUF (BF16) | no disponible | no disponible | completo | no disponible | llama.cpp |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros drafters.

## Limitaciones y advertencias

- No es un LLM autónomo: sin el modelo objetivo Qwen3.8-27B no genera respuestas utilizables.
- Los archivos D2T requieren una compilación parcheada de llama.cpp (código `qwen35`/`dflash` modificado); el runtime estándar fallará.
- Solo soporta inglés según el tag de idioma.
- El vocabulario D2T limita las propuestas del borrador a 32.768 tokens; los tokens fuera de ese subconjunto nunca se proponen, lo que puede reducir la tasa de aceptación en dominios con vocabulario especializado.
- La cuantización agresiva de los FFN gate/up (IQ3_S en Mixed-Low) puede degradar la tasa de aceptación frente al drafter BF16 original; no hay mediciones publicadas.
- Riesgo de sesgos y alucinaciones heredado del modelo objetivo y del drafter original; no evaluado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del drafter fuente z-lab y del modelo objetivo.
- La model card incluye solicitudes de donación (Monero, RTX 5090 FUND) sin relación con el uso técnico del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Plaguekind/Qwen3.8-27B-FrostDFlash-MixedLow-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente del drafter (BF16): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Cerebro Parasyte: https://huggingface.co/Plaguekind/Qwen3.8-27B-Parasyte-GGUF
- Apoyo al autor: https://throne.com/plaguekind/item/073bace1-2e1a-4492-95e6-024b4da6459b
