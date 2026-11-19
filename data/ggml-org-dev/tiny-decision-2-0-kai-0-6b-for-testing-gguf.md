# ggml-org-dev/tiny-Decision-2.0-Kai-0.6B-for-testing-GGUF

## Resumen

tiny-Decision-2.0-Kai-0.6B-for-testing-GGUF es un artefacto de prueba publicado por la organizacion ggml-org-dev dentro del ecosistema de llama.cpp. No es un modelo destinado a uso productivo: se trata de una copia deliberadamente modificada y "danada" (segun el propio autor) del modelo vllm-sr/Decision-2.0-Kai-0.6B, generada exclusivamente para validar el software de servidor de llama.cpp en el soporte del tipo de decision `vllm-decision2`. La model card advierte de forma explicita que su salida es incoherente (gibberish) y que no debe emplearse para ningun otro fin.

El modelo base pertenece a la familia Decision-2.0-Kai de vLLM Semantic Router, un tipo de modelo orientado a tareas de decision conversacional y enrutamiento semantico. La variante publicada aqui conserva la estructura del transformer original pero con un vocabulario drasticamente recortado (de 151.936 a 3.316 tokens) y pesos cuantizados a Q4_0, lo que reduce el repositorio a un tamano practicamente nulo (0,0 GB reportados).

Su relevancia es, por tanto, estrictamente tecnica y de infraestructura: sirve como fixture reproducible para pruebas de integracion de llama.cpp con modelos que incorporan una "cabeza de decision" (decision head) en F32, un patron emergente en el enrutamiento de modelos y en los sistemas de seleccion dinamica de LLM. Para desarrolladores que implementen soporte de este tipo de cabeceras, el artefacto documenta el flujo de conversion HF a GGUF y la estrategia de recorte de vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de decision conversacional, familia Decision-2.0-Kai) |
| Parametros totales | 201.632 (segun safetensors del modelo base); el nombre comercial indica 0,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (intermedio) y Q4_0 (final); embeddings incluidos en la cuantizacion, decision head en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con `convert_hf_to_gguf.py` de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Decision-2.0-Kai, disenado por vLLM Semantic Router para tareas de decision y enrutamiento conversacional. La arquitectura incorpora una cabeza de decision diferenciada que, en esta conversion GGUF, se mantiene en F32 mientras el resto de pesos se cuantiza a Q4_0. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de este artefacto no reside en el entrenamiento sino en el proceso de conversion y empaquetado: el vocabulario original de 151.936 tokens se reduce a 3.316 mediante la conservacion de tokens especiales y de control, todos los caracteres individuales, los tokens requeridos por las etiquetas de decision y los resultados de las primeras 2.000 fusiones BPE. Los identificadores de token se remapean, de modo que cualquier texto sigue tokenizandose pero en un numero mayor de tokens que con el tokenizador original. Esta estrategia permite mantener un artefacto minimo para pruebas de CI sin alterar la topologia del modelo.

## Capacidades

- Generacion de texto conversacional: heredada del modelo base, aunque en esta copia la salida es incoherente por diseno.
- Clasificacion y decision: conserva la cabeza de decision en F32, que es precisamente el componente bajo prueba en el servidor de llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el vocabulario recortado degrada la tokenizacion de cualquier idioma.
- Capacidades especiales: tipo de decision `vllm-decision2` integrado en llama-server; compatibilidad con endpoints declarada en los tags.

## Casos de uso

- Pruebas de integracion de llama.cpp: validar el tipo de decision `vllm-decision2` en el servidor mediante `llama-server -hf ggml-org-dev/tiny-Decision-2.0-Kai-0.6B-for-testing-GGUF:Q4_0`, comprobando que la cabeza de decision en F32 se carga y se ejecuta correctamente.
- CI/CD de herramientas GGUF: usar el artefacto como fixture reproducible en pipelines que verifiquen la conversion HF a GGUF y la cuantizacion con `llama-quantize`.
- Pruebas de remapeo de vocabulario: ejercitar el codigo de tokenizacion con un vocabulario reducido de 3.316 tokens para detectar regresiones en el manejo de IDs remapeados.
- Validacion de endpoints compatibles: comprobar la capa de compatibilidad de endpoints declarada en los tags del repositorio con un modelo de decision real.
- Desarrollo de enrutadores semanticos: probar la integracion de cabeceras de decision en pipelines de seleccion de modelo antes de desplegar el modelo base completo.
- Formacion y documentacion interna: ilustrar el flujo completo de publicacion de un GGUF de prueba, incluida la advertencia de no uso productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q4_0, dado el tamano del repositorio (0,0 GB reportados) y los 201.632 parametros del safetensors del modelo base.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien ejecutable en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-server`), y por extension cualquier runtime compatible con GGUF como Ollama o llama-cpp-python; vLLM y TGI no aplican a este formato.
- Latencia y throughput: no disponibles; al ser un modelo de prueba, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| tiny-Decision-2.0-Kai-0.6B-for-testing-GGUF | 201.632 (safetensors) / 0,6B nominal | no disponible | GGUF | Apache 2.0 | Pruebas de software |
| vllm-sr/Decision-2.0-Kai-0.6B | 0,6B | no disponible | safetensors | Apache 2.0 | Modelo de decision original |
| ggml-org-dev/tiny-Decision-2.0-Kai-0.6B-for-testing | 201.632 | no disponible | safetensors | Apache 2.0 | Version intermedia sin cuantizar |

La comparativa se limita a las variantes del mismo linaje, ya que no se dispone de informacion sobre modelos alternativos de la misma categoria con datos verificables.

## Limitaciones y advertencias

- La model card advierte explicitamente de que se trata de una copia modificada y danada: su salida es incoherente y no debe usarse para nada distinto de pruebas de software.
- El vocabulario esta recortado a 3.316 tokens, lo que degrada la tokenizacion de cualquier texto y aumenta el numero de tokens por entrada.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.
- Riesgo de alucinacion: total, dado que la salida es gibberish por diseno.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor prohibe el uso fuera de pruebas; el cumplimiento de la licencia no exime de la advertencia funcional.
- No apto para produccion bajo ninguna circunstancia; su unico valor es como fixture de integracion continua.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ggml-org-dev/tiny-Decision-2.0-Kai-0.6B-for-testing-GGUF
- Modelo base intermedio: https://huggingface.co/ggml-org-dev/tiny-Decision-2.0-Kai-0.6B-for-testing
- Modelo original: https://huggingface.co/vllm-sr/Decision-2.0-Kai-0.6B
- Repositorio llama.cpp (herramientas de conversion y servidor): https://github.com/ggml-org/llama.cpp
