# ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing-GGUF

## Resumen

`tiny-pplx-decider-v1-27b-for-testing-GGUF` es un artefacto de prueba publicado por la organizacion `ggml-org-dev` para validar el soporte del tipo de decision `pplx-decider` en el servidor de llama.cpp. No es un modelo destinado a inferencia real: la propia model card lo describe como una copia modificada y danada de `perplexity-ai/pplx-decider-v1-27b`, cuyo output es calificado de "gibberish" (sin sentido). Su unico proposito es servir como fixture en la bateria de tests del servidor de llama.cpp.

El modelo base declarado es `ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing`, a su vez derivado de `perplexity-ai/pplx-decider-v1-27b`, que segun la model card procede de `Qwen/Qwen3.8-27B`. A pesar de la etiqueta "27b" en el nombre, el repositorio safetensors asociado declara 592.452 parametros totales, lo que confirma que se trata de una version recortada y no del modelo completo.

La relevancia de esta ficha es acotada: sirve para documentar un caso de artefacto de test en el ecosistema GGUF y para advertir a desarrolladores e investigadores de que no deben confundirlo con un modelo funcional. La licencia es Apache 2.0 y el repo ocupa 0.0 GB, coherente con su naturaleza de fixture minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3.8-27B segun la model card; sin detalle arquitectonico publicado) |
| Parametros totales | 592.452 (segun safetensors del repo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (modelo de texto), Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto y mmproj en F16 convertidos con `convert_hf_to_gguf.py`; texto cuantizado a Q4_0 con `llama-quantize`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La model card indica que el artefacto se genera convirtiendo el modelo de texto y el `mmproj` a F16 mediante `convert_hf_to_gguf.py` de llama.cpp, y que despues el texto se cuantiza a Q4_0 con `llama-quantize`, incluyendo el token embedding y la salida. El `mmproj` se cuantiza a Q8_0, lo que sugiere que el modelo original incorpora componentes multimodales (proyeccion visual), aunque no se especifica su alcance.

La modificacion mas relevante es el recorte del vocabulario del modelo de texto: pasa de 248.320 tokens a 3.348 mediante `slice_vocab_gguf.py`, conservando tokens especiales, todos los caracteres individuales, la ruta BPE de las palabras etiqueta de decision (codigos de opcion A..Z, AA..ZZ) y los tokens de las primeras 2.000 fusiones. Los ids se renumeran y las filas de tamano vocabular del token embedding y del LM head se recortan para ajustarse. El texto sigue tokenizandose correctamente, pero en mas tokens y mas cortos que con el vocabulario original. No se publican datos sobre volumen de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Generacion de texto: no funcional en la practica; la model card advierte que el output es "gibberish".
- Razonamiento, codigo y matematicas: no disponible; no se documentan capacidades de este tipo.
- Vision: el repo incluye un `mmproj` cuantizado a Q8_0, lo que indica presencia de un proyector multimodal en el modelo base, aunque no se detalla su comportamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: tipo de decision `pplx-decider` soportado por el servidor de llama.cpp, orientado a la seleccion entre opciones codificadas (A..Z, AA..ZZ) segun la ruta BPE conservada en el vocabulario recortado.

## Casos de uso

- Pruebas de integracion del servidor de llama.cpp: el artefacto se usa como fixture para validar el tipo de decision `pplx-decider` en la bateria de tests del servidor. Es su unico uso previsto segun la model card.
- Validacion de `convert_hf_to_gguf.py`: sirve para comprobar que la conversion de un modelo de texto y su `mmproj` a F16 produce artefactos cargables.
- Validacion de `slice_vocab_gguf.py`: permite verificar el recorte de vocabulario de 248.320 a 3.348 tokens, la renumeracion de ids y el ajuste de las filas de token embedding y LM head.
- Pruebas de cuantizacion con `llama-quantize`: el repo incluye una variante Q4_0 del texto y Q8_0 del `mmproj`, util para comprobar la coherencia de las herramientas de cuantizacion.
- Test de carga via Hugging Face en `llama-server`: el comando `llama-server -hf ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing-GGUF:Q4_0` documenta el flujo de descarga y arranque del servidor con un modelo remoto.
- Verificacion de tokenizacion con vocabulario reducido: permite comprobar que el texto se tokeniza correctamente aunque se fragmente en mas tokens y mas cortos que con el vocabulario original.
- Regresion de pipelines GGUF: util como caso limite de repo de 0.0 GB y 592.452 parametros para detectar fallos en herramientas que asumen tamanos tipicos de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 592.452 parametros y cuantizacion Q4_0 el peso de los tensores es del orden de unos pocos MB, aunque el tamano real del repo figura como 0.0 GB y no se publica desglose.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna podria cargarlo, pero no hay recomendacion oficial.
- Cabe en GPU consumer: si, por el numero de parametros declarado, aunque no se documenta compatibilidad verificada.
- Opciones de despliegue: llama.cpp (`llama-server` con el flag `-hf` y la etiqueta `Q4_0`), y por extension las herramientas que consuman GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tiny-pplx-decider-v1-27b-for-testing-GGUF | 592.452 (safetensors del base) | no disponible | Apache 2.0 | Hugging Face | Fixture de test; output no funcional |
| perplexity-ai/pplx-decider-v1-27b | no disponible | no disponible | no disponible en la informacion | Hugging Face | Modelo original del que deriva el artefacto |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible en la informacion | Hugging Face | Modelo del que deriva, segun la model card, el original de Perplexity |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo es una copia modificada y danada del original; la model card advierte explicitamente de que su output es "gibberish" y de que no debe usarse para nada distinto de testear software.
- El vocabulario esta recortado de 248.320 a 3.348 tokens, lo que degrada la tokenizacion (mas tokens y mas cortos) y limita la cobertura lexica.
- La cuantizacion Q4_0 del texto y Q8_0 del `mmproj` anade perdida adicional de calidad respecto al modelo base.
- No hay informacion publicada sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de fixture no funcional hace inviable cualquier uso en produccion.
- El nombre "27b" no refleja el tamano real del repositorio (592.452 parametros declarados en safetensors); conviene no confundirlo con un modelo de 27.000 millones de parametros.
- El repo figura con 0 descargas y 0 likes en el momento de la consulta, lo que refuerza su caracter de artefacto interno de test.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing
- Modelo original de Perplexity: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Modelo de origen citado en la model card: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0 (referenciada en el repo): LICENSE
- Aviso legal del repo: NOTICE
