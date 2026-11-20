# openbmb/MiniCPM5-2B-DSpark-GGUF

## Resumen

MiniCPM5-2B-DSpark-GGUF es un modelo auxiliar de decodificación especulativa (draft model o modelo borrador) publicado por OpenBMB como parte de la familia MiniCPM5. No es un modelo de generación autónomo: su función es proponer tokens candidatos que el modelo objetivo MiniCPM5-2B verifica en paralelo dentro de llama.cpp, acelerando la inferencia sin alterar la distribución de salida del modelo principal. Se distribuye en formato GGUF con precisión BF16 y un peso de 653 MB.

El modelo se apoya en la arquitectura MiniCPM5 (transformer tipo Llama, según los tags del repositorio) y está pensado para despliegues en dispositivo (on-device) y edge, donde el coste por token y la latencia son críticos. Su integración se realiza mediante el tipo de draft `draft-dspark` de llama.cpp, con un máximo de 7 tokens especulativos por paso.

Es relevante ahora porque la decodificación especulativa se ha consolidado como la técnica estándar para reducir latencia en inferencia local sin requerir hardware de datacenter, y este repositorio ofrece un borrador empaquetado y listo para usar junto al modelo principal de 2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tags: `llama`, `minicpm5`); modelo borrador para decodificación especulativa |
| Parametros totales | 323.776.001 (dato de safetensors); el archivo GGUF se denomina `MiniCPM5-2.6B-DSpark.gguf` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso configura `-c 8192` para el servidor) |
| Tipos de cuantizacion | BF16 (único archivo publicado, 653 MB) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del borrador más allá de los tags `llama` y `minicpm5`. Se trata de un modelo pequeño (323,8 M de parámetros según safetensors) diseñado específicamente como draft para decodificación especulativa sobre MiniCPM5-2B. En este esquema, el borrador genera hasta 7 tokens candidatos por paso (`--spec-draft-n-max 7`) que el modelo objetivo valida en una sola pasada, manteniendo la salida idéntica a la del modelo principal.

Los datasets listados en la model card (Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609, UltraData-RL-2609) corresponden al ecosistema de entrenamiento de MiniCPM5 y aparecen como referencia del proyecto; la model card no detalla qué subconjunto se usó para entrenar el borrador ni el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del propio mecanismo de decodificación especulativa.

## Capacidades

- Decodificación especulativa: genera tokens candidatos para que MiniCPM5-2B los verifique, acelerando la inferencia en llama.cpp.
- Integración nativa con `llama-server` mediante `--spec-type draft-dspark` y `--spec-draft-n-max`.
- Compatibilidad con el modelo objetivo MiniCPM5-2B en GGUF (cuantización Q4_K_M en el ejemplo oficial).
- Soporte de tool calling y contexto largo heredado del ecosistema MiniCPM5 (tags `tool-calling`, `long-context`), aunque aplicado al modelo principal, no al borrador.
- Idiomas: inglés y chino.
- No es un modelo para uso directo como generador: no se documenta razonamiento, matemáticas, código o visión como capacidades propias.

## Casos de uso

- Aceleración de inferencia local: desplegar MiniCPM5-2B-Q4_K_M junto con este borrador en `llama-server` para reducir la latencia por token en equipos de sobremesa o portátiles, manteniendo la calidad del modelo principal.
- Asistentes on-device: aplicaciones de escritorio o móviles que ejecutan MiniCPM5-2B en local y necesitan respuestas interactivas con menor tiempo hasta el primer token verificado.
- Servicios de chat de bajo coste: entornos con GPUs consumer donde el throughput importa y se quiere exprimir el modelo de 2B sin cambiar de hardware.
- Prototipado de pipelines de decodificación especulativa: validar el tipo `draft-dspark` de llama.cpp antes de adoptarlo en producción con otros pares borrador-objetivo.
- Evaluación comparativa de latencia: medir la ganancia real de la decodificación especulativa frente a la decodificación estándar en el mismo hardware y cuantización.
- Despliegues edge con presupuesto de memoria ajustado: el borrador añade solo 653 MB en BF16, un coste asumible en dispositivos con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del borrador: 653 MB en BF16, adicionales a la memoria del modelo objetivo MiniCPM5-2B.
- VRAM total estimada: la del modelo principal según cuantización (el ejemplo usa Q4_K_M) más ~0,65 GB del borrador.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 y en Apple Silicon vía Metal.
- Despliegue: llama.cpp (`llama-server`), con `-ngl 99 -ngld 99 -fa on` según el ejemplo oficial; no se documenta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; la ganancia depende del hardware, la cuantización del modelo objetivo y la tasa de aceptación del borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM5-2B-DSpark (este) | 323,8 M | no disponible | Borrador de decodificación especulativa para MiniCPM5-2B | Apache-2.0 | GGUF BF16 |
| MiniCPM5-2B | no disponible en la informacion | no disponible | Modelo objetivo de generación | Apache-2.0 | GGUF (Q4_K_M en el ejemplo) |
| Otros borradores especulativos (EAGLE, Medusa, draft genéricos) | variable | no disponible | Aceleración de inferencia | variable | variable |

No se dispone de datos de rendimiento comparativo entre alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de generación autónomo: usarlo sin el modelo objetivo MiniCPM5-2B no tiene sentido práctico.
- Solo se publica en BF16; no hay cuantizaciones del borrador, lo que limita el ahorro de memoria en entornos muy restringidos.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- La ganancia de velocidad depende de la tasa de aceptación del borrador y puede variar según la tarea y el dominio.
- Riesgo de alucinación y sesgos inherente al modelo principal, no evaluado específicamente para el borrador.
- La model card incluye un descargo de responsabilidad estándar: salidas generadas estadísticamente, posible contenido inexacto u ofensivo, y respuestas sobre temas sensibles sin revisión experta.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe configurar sus propias salvaguardas y etiquetar el contenido generado por IA cuando sea requerido.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark-GGUF
- Modelo objetivo MiniCPM5-2B (GGUF): https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Modelo original MiniCPM5-2B-DSpark: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Paper técnico MiniCPM: https://arxiv.org/pdf/2506.07900
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Documentación (Wiki en chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Licencia: https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE
