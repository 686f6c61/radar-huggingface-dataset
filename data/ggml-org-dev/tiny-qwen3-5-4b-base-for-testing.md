# ggml-org-dev/tiny-Qwen3.5-4B-Base-for-testing

## Resumen

tiny-Qwen3.5-4B-Base-for-testing es una copia deliberadamente reducida y "dañada" del modelo Qwen/Qwen3.5-4B-Base (revision 1001bb4), publicada por la organizacion ggml-org-dev. No es un modelo funcional: su unico proposito es servir como fixture ligero para probar software de inferencia y conversion de pesos, en particular el ecosistema llama.cpp. El autor advierte explicitamente de que la salida del modelo es incoherente (gibberish) y de que no debe usarse para ninguna tarea real.

El modelo conserva la arquitectura, el tokenizador y las configuraciones del Qwen3.5-4B-Base original (atencion lineal hibrida combinada con atencion completa con compuertas, capa MTP y codificador de vision), pero con dimensiones drasticamente recortadas para que quepa en entornos de integracion continua. El resultado son apenas 9.465.476 parametros reales frente a los aproximadamente 4.000 millones del modelo del que deriva.

Su relevancia es puramente instrumental: actua como modelo base del adaptador LoRA de decision tiny-kev-4b-for-testing, de modo que el conversor de llama.cpp descarga este checkpoint y fusiona el adaptador sobre el. Para desarrolladores que mantienen tooling de conversion, cuantizacion o carga de modelos, es un recurso util porque reproduce la topologia exacta de Qwen3.5-4B sin el coste computacional de manejar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal + atencion completa con compuertas, con capa MTP y codificador de vision |
| Parametros totales | 9.465.476 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la topologia del Qwen3.5-4B-Base original pero con todas las dimensiones internas recortadas. El modelo de texto conserva 4 de las 32 capas originales (capas 0, 1, 2 y 3: tres de atencion lineal y una de atencion completa), con hidden size reducido de 2560 a 32, FFN de 9216 a 128, 16 cabezas de atencion reducidas a 2 y 4 KV heads reducidas a 1, manteniendo head_dim en 256. En la atencion lineal, las cabezas de clave pasan de 16 a 2 y las de valor de 32 a 6, conservando las dimensiones de cabeza de 128. La capa MTP se mantiene, estrechada de la misma forma.

El token embedding conserva el vocabulario completo pero se estrecha al nuevo hidden size, manteniendo los embeddings atados. El codificador de vision pasa de 24 a 2 bloques, con hidden size de 1024 a 128, 16 cabezas a 2, FFN de 4096 a 256 y salida de 2560 a 32. El recorte se realizo con el script slice_qwen35_lora.py, siguiendo la skill slice-model de llama.cpp.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO. El autor indica que el modelo es una copia modificada y danada del checkpoint original, por lo que no se ha realizado ningun entrenamiento adicional sobre el.

## Capacidades

- No es un modelo funcional: el autor declara explicitamente que su salida es incoherente y que no debe usarse para ninguna tarea real.
- Conserva la arquitectura del Qwen3.5-4B-Base, incluida la atencion lineal hibrida, la capa MTP y el codificador de vision, lo que permite probar rutas de codigo que dependen de esas estructuras.
- Conserva el tokenizador y las configuraciones del modelo original, util para validar pipelines de tokenizacion y carga de configuraciones.
- Sirve como modelo base para fusionar el adaptador LoRA tiny-kev-4b-for-testing mediante el conversor de llama.cpp.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes en un sentido utilizable.
- No hay informacion sobre capacidades multilingues.

## Casos de uso

- Pruebas de integracion continua en llama.cpp: el modelo permite ejecutar el pipeline completo de descarga, conversion y carga en CI sin el coste de manejar los aproximadamente 4.000 millones de parametros del Qwen3.5-4B-Base.
- Validacion de la skill slice-model: el script slice_qwen35_lora.py y su resultado sirven como referencia para verificar que el recorte de capas, cabezas y dimensiones se aplica correctamente.
- Pruebas de fusion de adaptadores LoRA: al ser el modelo base de tiny-kev-4b-for-testing, permite validar el flujo de merge del conversor de llama.cpp de extremo a extremo.
- Verificacion de soporte de arquitectura hibrida: comprueba que el runtime maneja correctamente la combinacion de atencion lineal y atencion completa con compuertas en un checkpoint real.
- Pruebas del codificador de vision: valida la carga y el recorrido del encoder reducido a 2 bloques dentro del grafo del modelo.
- Pruebas de la capa MTP: permite comprobar que el runtime procesa correctamente la capa de prediccion multi-token en un checkpoint de dimensiones minimas.
- Validacion de tokenizador y configuraciones: sirve para comprobar que el pipeline respeta el vocabulario completo y los embeddings atados del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantizacion, dado que el checkpoint tiene 9.465.476 parametros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en CPU sin dificultad.
- Opciones de despliegue: llama.cpp y su ecosistema (incluido el conversor que fusiona el adaptador LoRA); no hay informacion sobre soporte en vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de pruebas con salida incoherente, las metricas de calidad no son aplicables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-Qwen3.5-4B-Base-for-testing | 9.465.476 | no disponible | Fixture de pruebas para llama.cpp | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | ~4.000 millones (aproximado, no confirmado en la informacion) | no disponible | Modelo base funcional | Apache 2.0 | Hugging Face |
| ggml-org-dev/tiny-kev-4b-for-testing | no disponible | no disponible | Adaptador LoRA de decision sobre este modelo | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor advierte de que es una copia modificada y danada del modelo original y de que su salida es incoherente; no debe usarse para ninguna tarea distinta de las pruebas de software.
- No es apto para produccion, investigacion ni evaluacion de calidad.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma, porque el modelo no genera lenguaje utilizable.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de fixture de pruebas hace que ese uso carezca de sentido practico.
- Las dimensiones recortadas (hidden size 32, FFN 128) no representan el comportamiento del Qwen3.5-4B-Base original; los resultados de pruebas de rendimiento no son extrapolables.
- No se especifican la longitud de contexto ni los formatos de cuantizacion soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-Qwen3.5-4B-Base-for-testing
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Adaptador LoRA relacionado: https://huggingface.co/ggml-org-dev/tiny-kev-4b-for-testing
- Script de recorte: slice_qwen35_lora.py (incluido en el repositorio del modelo)
- Licencia: LICENSE (incluido en el repositorio del modelo)
