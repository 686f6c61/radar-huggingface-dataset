# dokoomae/LFM3-1.7B-think-lang-fix-patch

## Resumen

LFM3-1.7B-think-lang-fix-patch es un bundle de parcheo de pesos publicado por el usuario dokoomae sobre el modelo base LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parametros desarrollado por Liquid AI. El paquete no contiene un modelo completo: es un conjunto de factores de rango 1 (497 KB) que modifican 13 tensores de la capa `feed_forward.w2` del modelo base para corregir un sesgo de idioma en el modo de razonamiento `<think>`.

El problema que resuelve es concreto: en el modelo original, cuando se activa el modo de pensamiento, el razonamiento interno tiende a generarse en ingles independientemente del idioma del prompt. El parche hace que el CoT (chain of thought) siga el idioma de la entrada, de modo que un prompt en chino produce razonamiento en chino y uno en ingles produce razonamiento en ingles. Segun la model card, no hay entrenamiento ni gradientes: es una intervencion quirurgica sobre los pesos en inferencia.

La relevancia es doble. Por un lado, demuestra una tecnica de edicion de modelos basada en diagnostico de mecanismos internos (que capas MLP escriben la prior de idioma en el residual stream) y aplicacion de proyecciones de rango 1 con coeficientes calibrados. Por otro, es un ejemplo de parche reproducible y ligero que no requiere reentrenar ni redistribuir el modelo base, lo que facilita su adopcion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); el bundle aplica factores de rango 1 sobre capas MLP `feed_forward.w2` |
| Parametros totales | 1.700 millones (modelo base); el parche anade 497 KB de factores |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | el parche mejora el seguimiento de idioma en el razonamiento para chino, ingles, malayo y japones (segun la bateria de pruebas de la model card); el conjunto completo de idiomas del modelo base no se detalla |
| Licencia | Apache-2.0 para el parche; el modelo base queda bajo Liquid AI Community License |
| Formato de pesos | safetensors (`thinklang_rank1_patch.safetensors`) mas `patch_meta.json` y `apply_patch.py` |

## Arquitectura y entrenamiento

El bundle no entrena nada: es un conjunto de factores de rango 1 por capa, compuesto por un vector `g[2048]`, un vector `proj[7680]` y un coeficiente `coeff`, aplicados sobre 13 tensores `model.layers.{l}.feed_forward.w2.weight` con `l ∈ {5,6,7,11,12,13,16,18,19,20,21,22,23}`. La formula de actualizacion es `w2_new = w2 + coeff · outer(g, proj)`, calculada en fp32 y convertida de nuevo a bf16. Los otros 273 tensores del modelo base quedan intactos.

El diagnostico recogido en el informe tecnico (en chino) identifica la causa raiz: las MLP de las capas 18-22 escriben de forma indiscriminada una prior de CoT en ingles en el residual stream, mientras que la MLP de la capa 23 es la que sigue correctamente el idioma del prompt pero tiene un peso insuficiente. El parche aplica `coeff = -1.2` en 11 capas para proyectar fuera esa prior y `coeff = +1.5` en las capas 19 y 23 para amplificar 2,5 veces los escritores correctos a lo largo del mismo eje. El resultado se fusiona con `apply_patch.py` sobre una copia local del modelo base y produce un directorio intercambiable con el original (mismo config, tokenizer y chat template), cargable con `transformers` o vLLM mediante `trust_remote_code=True`.

## Capacidades

- Generacion de texto y razonamiento en modo `<think>` con el razonamiento interno alineado al idioma del prompt.
- Correccion del sesgo de "apertura en ingles" en el CoT: prompts en chino pasan de 3/12 a 12/12 respuestas con razonamiento en chino.
- Mejora del seguimiento de idioma en japones (de 0/2 a 2/2) y en malayo (de 1/3 a 2/3) segun la bateria de 25 prompts de la model card.
- Mantiene el comportamiento en ingles sin regresion (8/8 tanto en baseline como parcheado).
- Compatibilidad con el chat template y el tokenizer originales del modelo base.
- Carga directa en `transformers` y vLLM con `trust_remote_code=True`.
- Las capacidades especificas del modelo base (tool calling, agentes, vision, audio) no se detallan en la informacion proporcionada.

## Casos de uso

- Razonamiento multilingue en produccion: en asistentes que atienden a usuarios en chino o japones, el parche evita que el CoT se genere en ingles y reduce la fuga de idioma en la respuesta final, manteniendo coherencia linguistica en toda la traza.
- Evaluacion de modelos de razonamiento en idiomas no ingleses: util para investigadores que necesitan medir el CoT en el mismo idioma del prompt sin reentrenar el modelo base, aplicando el parche sobre una copia local.
- Despliegue ligero en vLLM: al ser un parche de 497 KB que se fusiona en los pesos, el modelo resultante se sirve con el mismo stack que el original y sin overhead en inferencia.
- Reproducibilidad de experimentos de edicion de modelos: el bundle incluye `patch_meta.json` con los ejes, capas y coeficientes, lo que permite replicar o variar la intervencion en otros modelos de la familia.
- Localizacion de asistentes conversacionales: para productos dirigidos a mercados asiaticos donde el razonamiento en ingles degrada la calidad percibida de la respuesta, el parche alinea el idioma interno con el externo.
- Investigacion en mechanistic interpretability: el diagnostico por capas (que MLP escribe la prior y cual sigue el idioma) sirve como caso de estudio para analisis de circuitos en transformers pequenos.
- Pipelines de CI para modelos: al ser un script (`apply_patch.py`) reproducible, se puede integrar en un flujo de build que genere la variante parcheada a partir del modelo base y verifique la bateria de prompts.

## Benchmarks y rendimiento

Resultados de la bateria de 25 prompts con los ajustes de muestreo oficiales, segun la model card:

| Idioma del prompt | Baseline | Parcheado |
|---|---|---|
| Chino | 3/12 (25%) | 12/12 (100%) |
| Ingles | 8/8 (100%) | 8/8 (100%) |
| Malayo | 1/3 (33%) | 2/3 (67%) |
| Japones | 0/2 (0%) | 2/2 (100%) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base LFM3-1.7B y de la cuantizacion elegida (no se detallan las cuantizaciones soportadas).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado; el parche en si anade solo 497 KB, por lo que los requisitos son los del modelo base sin modificar.
- Opciones de despliegue: `transformers` y vLLM con `trust_remote_code=True`; el directorio de salida es intercambiable con el original (mismo config, tokenizer y chat template).
- Latencia y throughput: no disponibles; el parche se fusiona en los pesos en tiempo de build, por lo que no deberia anadir overhead en inferencia respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento multilingue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-think-lang-fix (este bundle) | 1.700 M (base) + parche 497 KB | no disponible | CoT alineado al idioma del prompt (chino, ingles, malayo, japones) | Apache-2.0 (parche) + Liquid AI Community License (base) | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1.700 M | no disponible | CoT tiende al ingles | Liquid AI Community License | Hugging Face |
| Alternativas de ~1,7 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El parche no elimina el sesgo de idioma por completo: en malayo la tasa de acierto sube solo al 67% (2/3) y la bateria de evaluacion es muy reducida (25 prompts), por lo que la significancia estadistica es limitada.
- El diagnostico y el informe tecnico estan en chino (`technical_report_zh.pdf`), lo que puede dificultar la revision por parte de lectores no sinohablantes.
- La licencia del parche es Apache-2.0, pero el modelo base queda bajo la Liquid AI Community License; el uso comercial del modelo fusionado debe cumplir ambas condiciones.
- El bundle no incluye los pesos del modelo base: es necesario descargar LiquidAI/LFM3-1.7B por separado y aplicar `apply_patch.py`, lo que anade un paso de build al despliegue.
- Los coeficientes (`-1.2` en 11 capas, `+1.5` en las capas 19 y 23) estan calibrados para este modelo base concreto; no hay evidencia de que transfieran a otras variantes o tamanos de la familia LFM3.
- Riesgo de alucinacion y sesgos del modelo base: no se documentan en la informacion proporcionada; el parche no aborda estos aspectos.
- El repositorio no tiene descargas ni likes y el tamano reportado es de 0.0 GB, lo que sugiere que el bundle puede no estar completamente subido o que la metadata de Hugging Face no refleja el contenido real; conviene verificar los ficheros antes de usarlo en produccion.
- No se detallan los idiomas soportados por el modelo base ni las capacidades adicionales (tool calling, agentes, vision), por lo que no se puede garantizar su comportamiento fuera del alcance del parche.

## Enlaces

- Repositorio del parche: https://huggingface.co/dokoomae/LFM3-1.7B-think-lang-fix-patch
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante parcheada publicada por el autor: https://huggingface.co/dokoomae/LFM3-1.7B-think-lang-fix
- Informe tecnico (en chino): `technical_report_zh.pdf` incluido en el repositorio
- Script de aplicacion: `apply_patch.py` incluido en el repositorio
