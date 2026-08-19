# masafy/kimi-fii-lora

## Resumen

`masafy/kimi-fii-lora` es un adaptador LoRA de 39,4 MB entrenado sobre el modelo MoE `moonshotai/Kimi-Linear-48B-A3B-Instruct` (48B parámetros totales, 3B activos). Su propósito es modificar el estilo de salida en japonés para que todas las frases terminen con la muletilla «〜ですフィー。」. El autor, masafy, lo presenta como un experimento de bajo coste (2,80 USD en alquiler de GPU) que demuestra cómo adaptar un modelo de código abierto de gran tamaño con QLoRA 4-bit.

El interés técnico del proyecto no reside tanto en el resultado estilístico como en el proceso: el código público de Moonshot AI está diseñado únicamente para inferencia e incluye seis barreras (asserts, decoradores `@torch.no_grad()`, dependencias de flash-attn) que impiden el entrenamiento. El autor documenta en `scripts/patch_kimi_moe.py` cómo sortearlas para habilitar una ruta diferenciable a través del router MoE. El adaptador se aplica exclusivamente a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`, sin tocar los expertos ni el gate.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Kimi-Linear-48B-A3B-Instruct (MoE) |
| Parametros totales | 9.854.976 (adaptador); 48B en el modelo base |
| Parametros activos | 3B en el modelo base (no aplica al adaptador) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 + double quant (entrenamiento); adaptador en bf16 |
| Idiomas soportados | japones (adaptador); el modelo base soporta multilingue |
| Licencia | CC BY-SA 3.0 (adaptador y datos); MIT (codigo y modelo base) |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA (4-bit NF4 con doble cuantización, cómputo en bf16) sobre el modelo base Kimi-Linear-48B-A3B-Instruct, un transformer MoE con 48B parámetros totales y 3B activos por token. La configuración LoRA usa r=16 y alpha=32, aplicada únicamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), dejando intactos los expertos y el router. El dataset de entrenamiento consta de 630 ejemplos en japonés: 500 de conversación general, 50 sobre pandas rojos y 80 de control negativo, derivados de `kunishou/databricks-dolly-15k-ja`. Se entrenaron 2 épocas (158 pasos) con una tasa de aprendizaje de 1e-4.

La innovación técnica principal es el parcheo del código de Moonshot AI, que originalmente impide el entrenamiento mediante un `assert not self.training` en el gate MoE, un método `moe_infer` decorado con `@torch.no_grad()` y la imposición de flash-attention. El autor reescribió la ruta de forward para hacerla diferenciable, evitando además una modificación in-place del tensor `scores` que rompía el autograd. También resolvió incompatibilidades con la librería `fla-core`, fijando las versiones `transformers==4.57.1`, `peft==0.20.0`, `bitsandbytes==0.50.1` y `fla-core==0.5.2` como requisito obligatorio.

## Capacidades

- Modificación del estilo de salida en japonés: añade la muletilla «〜ですフィー。」 al final de las respuestas.
- Tasa de activación de la muletilla: 86,7% en conversación general, 99,2% en conversación sobre pandas, 93,7% en otros animales (frente al 0% del modelo base).
- Generalización a frases no vistas durante el entrenamiento: el patrón se activa incluso con expresiones nuevas.
- No añade capacidades nuevas al modelo base: conserva las del Kimi-Linear-48B-A3B-Instruct (generación de texto, razonamiento, código, etc.), aunque con el estilo modificado.
- No soporta tool calling ni funciones de agente específicas del adaptador; depende de las capacidades del base.

## Casos de uso

- Creación de personajes de chatbot con personalidad definida: el adaptador permite que un asistente japonés adopte una muletilla característica, útil para juegos, ficción interactiva o demos de producto.
- Experimentación con fine-tuning de modelos MoE de gran tamaño: el script `patch_kimi_moe.py` sirve como referencia para habilitar entrenamiento en modelos con código de inferencia restringido.
- Investigación sobre el efecto de desequilibrios en datos de entrenamiento: el fallo documentado en la extensión de respuestas sobre pandas rojos (la longitud media cayó de 560 a 185 caracteres) ilustra cómo la mayoría de datos cortos domina el comportamiento del LoRA.
- Prototipado de bajo coste: con 2,80 USD y 4 horas de GPU se puede validar una hipótesis de adaptación de estilo sobre un modelo de 48B.
- Evaluación de la transferencia de patrones lingüísticos: el adaptador demuestra que un LoRA pequeño (0,02% de los parámetros) puede imponer una regla estilística consistente.
- Base para estudios de sobreajuste en LoRA: el autor documenta que 2 épocas con lr 1e-4 provocan bucles de repetición en respuestas largas, un caso de estudio útil para calibrar hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye métricas propias del experimento:

| Metrica | Base | Con LoRA |
|---|---|---|
| Tasa de muletilla (conversacion general) | 0,0% | 86,7% |
| Tasa de muletilla (conversacion sobre pandas) | 0,0% | 99,2% |
| Tasa de muletilla (otros animales) | 0,0% | 93,7% |
| Longitud media de respuesta (pandas) | 559,9 caracteres | 184,8 caracteres |
| Longitud media de respuesta (otros animales) | 215,2 caracteres | 62,4 caracteres |
| Longitud media de respuesta (conversacion general) | 248,9 caracteres | 101,5 caracteres |

## Requisitos de hardware

- Inferencia con el adaptador: requiere cargar el modelo base de 48B. En fp16 ocupa aproximadamente 96 GB de VRAM; con cuantización 4-bit puede caber en una GPU de 48 GB (por ejemplo, RTX A6000, A40) o en configuraciones multi-GPU.
- Entrenamiento (según la model card): RTX A6000 48 GB, con pico de VRAM de 41,65 GB. Tiempo total de entrenamiento: 2 horas 39 minutos (158 pasos, ~60 s/paso).
- Coste de entrenamiento: 2,80 USD en Vast.ai a 0,5125 USD/hora.
- Despliegue: el adaptador se carga con `transformers` + `peft`; el modelo base requiere `trust_remote_code=True`. No se mencionan integraciones con vLLM, Ollama o llama.cpp.
- Versiones de librerías fijadas obligatoriamente: `transformers==4.57.1`, `fla-core==0.5.2`, `peft==0.20.0`, `bitsandbytes==0.50.1`.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en la misma categoría (modificación de estilo en japonés sobre MoE de 48B). Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Kimi-Linear-48B-A3B-Instruct (base) | 48B totales / 3B activos | no disponible | MIT | Generación general, sin muletilla |
| masafy/kimi-fii-lora (adaptador) | 9,85M (adaptador) | no disponible | CC BY-SA 3.0 | Japonés con muletilla «〜ですフィー。」 |
| Otros LoRA de estilo en japonés | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador está sobreentrenado (2 épocas con lr 1e-4): puede provocar bucles de repetición en respuestas largas, especialmente en listas o enumeraciones.
- El efecto de la muletilla se limita al japonés; en otros idiomas el adaptador no tiene efecto o puede degradar la calidad de salida.
- El intento de alargar las respuestas sobre pandas rojos fracasó: la longitud media se redujo en lugar de aumentar, debido al desequilibrio del dataset (580 respuestas cortas frente a 50 largas).
- El adaptador no incluye los pesos del modelo base; es necesario descargar el base de 98 GB por separado.
- Las versiones de las librerías están fijadas de forma estricta; usar versiones superiores de `transformers` o `fla-core` rompe la carga o el entrenamiento.
- La licencia CC BY-SA 3.0 del adaptador y los datos implica que cualquier obra derivada debe compartirse bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.
- El código de entrenamiento requiere parchear el modelo base (`patch_kimi_moe.py`); sin el parche, el entrenamiento no es posible, aunque la inferencia sí funciona sin él.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/masafy/kimi-fii-lora
- Modelo base: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/kunishou/databricks-dolly-15k-ja
- Perfil del autor: https://huggingface.co/masafy/models
- Script de parcheo (referenciado en la model card): `scripts/patch_kimi_moe.py` dentro del repositorio del adaptador
