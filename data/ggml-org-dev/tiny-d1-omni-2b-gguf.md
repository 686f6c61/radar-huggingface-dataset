# ggml-org-dev/tiny-d1-Omni-2B-GGUF

## Resumen

tiny-d1-Omni-2B-GGUF es un artefacto de prueba publicado por la organizacion ggml-org-dev, no un modelo destinado a uso real. Se trata de una copia "modificada y danada" del modelo LiquidAI/d1-Omni-2B, segun advierte explicitamente la propia model card, cuyo unico proposito es validar el software de llama.cpp. La salida del modelo es descrita por el autor como "gibberish" (texto sin sentido), por lo que no debe emplearse para inferencia productiva ni para evaluacion de capacidades.

El artefacto se genera convirtiendo el modelo base ggml-org-dev/tiny-d1-Omni-2B-for-testing con el script `convert_hf_to_gguf.py` de llama.cpp. Durante la conversion se recorta drasticamente el vocabulario del modelo de texto, de 128.000 a unos 2.500 tokens, conservando tokens especiales, caracteres individuales, las palabras de etiqueta de decision y las primeras 2.000 fusiones BPE, con renumeracion de los identificadores de token. El modelo de texto se cuantiza a Q4_0 y el proyector multimodal (mmproj) a Q8_0.

Su relevancia es puramente de ingenieria: sirve como fixture en las pruebas del servidor de llama.cpp para el tipo de decision `lfm3-d1-omni`. El repositorio ocupa 0,1 GB y el dato de parametros registrado en safetensors es de 391.360, muy alejado de los 2B que sugiere el nombre, lo que confirma que se trata de un modelo truncado para pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LiquidAI/d1-Omni-2B; tipo decision-model, conversacional) |
| Parametros totales | 391.360 (dato de safetensors; el nombre indica 2B pero el artefacto esta truncado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (modelo de texto), Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo original LiquidAI/d1-Omni-2B en la documentacion proporcionada; la model card solo indica que el artefacto es un modelo de decision conversacional con componente multimodal (existe un proyector mmproj). El proceso aplicado por ggml-org-dev no es un entrenamiento, sino una conversion y mutilacion controlada: se parte del modelo base de prueba, se convierte a GGUF con `convert_hf_to_gguf.py` y se recorta el vocabulario de texto de 128.000 a aproximadamente 2.500 tokens, conservando tokens especiales, caracteres sueltos, las palabras de etiqueta de decision y las primeras 2.000 fusiones BPE, con renumeracion de ids.

Como consecuencia, la tokenizacion del artefacto difiere por completo de la del modelo real y la calidad de generacion queda destruida de forma deliberada. No hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo original en la informacion disponible. La innovacion tecnica relevante aqui no es de modelado, sino de infraestructura: el artefacto permite ejercitar la ruta de codigo del tipo de decision `lfm3-d1-omni` en las pruebas del servidor de llama.cpp con un fichero de apenas 0,1 GB.

## Capacidades

- Generacion de texto: tecnicamente emite tokens, pero la salida es texto sin sentido por diseno del artefacto.
- Razonamiento, codigo, matematicas y vision: no evaluables ni utilizables en esta copia; el modelo original podria tener capacidades multimodales, pero no estan documentadas en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Uso previsto real: servir como fixture de pruebas del servidor de llama.cpp para el tipo de decision `lfm3-d1-omni`.

## Casos de uso

- Pruebas de integracion de llama.cpp: ejecutar `llama-server -hf ggml-org-dev/tiny-d1-Omni-2B-for-testing-GGUF:Q4_0` para validar que la ruta de carga y el tipo de decision `lfm3-d1-omni` funcionan correctamente.
- CI/CD de herramientas GGUF: incorporar el artefacto como fixture ligero (0,1 GB) en pipelines que verifiquen conversiones, carga de vocabularios recortados y cuantizacion Q4_0/Q8_0.
- Desarrollo de parsers de vocabulario: probar el manejo de vocabularios truncados y renumerados, un caso limite util para validar codigo que asume vocabularios completos.
- Validacion de mmproj: comprobar la carga del proyector multimodal cuantizado a Q8_0 junto al modelo de texto en Q4_0.
- Pruebas de regresion del servidor HTTP: verificar endpoints compatibles y el comportamiento del servidor con modelos de decision conversacionales sin coste de descarga elevado.
- Docencia y demostracion de tooling: mostrar el flujo `convert_hf_to_gguf.py` y el empaquetado GGUF en entornos con recursos limitados.

En ningun caso debe emplearse para atencion al cliente, generacion de codigo en produccion, agentes autonomos ni ninguna aplicacion real: la propia model card prohibe explicitamente ese uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que la salida es texto sin sentido, por lo que cualquier metrica de calidad carece de significado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el modelo de texto en Q4_0 y el mmproj en Q8_0, dado el tamano del repositorio (0,1 GB) y los 391.360 parametros registrados.
- GPU recomendadas: cualquiera con soporte de llama.cpp; el artefacto cabe en GPU integradas y en CPU.
- GPU de consumo: si, en cualquier GPU de consumo moderna e incluso en hardware de gama baja.
- Opciones de despliegue: llama.cpp (`llama-server`), y por formato GGUF potencialmente Ollama u otros runners compatibles, aunque no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| ggml-org-dev/tiny-d1-Omni-2B-GGUF | 391.360 (segun safetensors) | no disponible | GGUF | LFM Open License v1.0 | Pruebas de llama.cpp |
| LiquidAI/d1-Omni-2B | no disponible | no disponible | no disponible | LFM Open License v1.0 | Modelo real de referencia |
| ggml-org-dev/tiny-d1-Omni-2B-for-testing | no disponible | no disponible | safetensors (base) | LFM Open License v1.0 | Modelo base de prueba |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que es una copia modificada y danada cuyo output es gibberish; no debe usarse para nada distinto de probar software.
- El vocabulario esta recortado de 128.000 a unos 2.500 tokens con renumeracion de ids, por lo que la tokenizacion no coincide con la del modelo real y cualquier integracion basada en ids de token fallara.
- El dato de parametros (391.360) no cuadra con el nombre "2B"; el artefacto esta truncado y no representa al modelo original.
- Riesgo de alucinacion: total por diseno; la salida no es fiable en ningun grado.
- Sesgos conocidos: no evaluables en este artefacto.
- Restricciones de licencia: hereda la LFM Open License v1.0 de Liquid AI; conviene revisar sus terminos para cualquier redistribucion, aunque el uso previsto es solo testing.
- No apto para produccion, evaluacion de calidad ni benchmarks comparativos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-GGUF
- Modelo base de prueba: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-for-testing
- Modelo original: https://huggingface.co/LiquidAI/d1-Omni-2B
- Licencia LFM Open License v1.0: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-GGUF/blob/main/LICENSE
