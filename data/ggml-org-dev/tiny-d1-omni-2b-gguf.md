# ggml-org-dev/tiny-d1-Omni-2B-GGUF

## Resumen

tiny-d1-Omni-2B-GGUF es un artefacto de pruebas publicado por la organizacion ggml-org-dev, el espacio que el equipo de llama.cpp utiliza para validar conversiones y tests de integracion. No es un modelo pensado para uso real: la propia model card lo describe como una copia modificada y danada de LiquidAI/d1-Omni-2B, cuyo output es gibberish deliberado. Su unico proposito es servir como fixture en las pruebas del servidor de llama.cpp para el tipo de decision `lfm3-d1-omni`.

El repositorio contiene una conversion a GGUF del modelo base ggml-org-dev/tiny-d1-Omni-2B, realizada con `convert_hf_to_gguf.py`, con el modelo de texto y el proyector multimodal (mmproj) en F16 y el texto cuantizado a Q8_0 mediante `llama-quantize`. Aunque el nombre comercial sugiere 2B parametros, los pesos safetensors del repositorio declaran 34.481.472 parametros totales, es decir, un modelo de escala muy reducida (decenas de millones), coherente con su funcion de test.

Su relevancia es, por tanto, exclusivamente de infraestructura: permite a los desarrolladores de llama.cpp verificar el pipeline de conversion, la carga de modelos multimodales en formato GGUF y el comportamiento del servidor con la familia d1-Omni sin necesidad de descargar el modelo completo de Liquid AI. Cualquier uso fuera de ese contexto de testing carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/d1-Omni-2B; no se detalla en la informacion proporcionada) |
| Parametros totales | 34.481.472 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (texto); F16 (texto original y mmproj) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF (texto + mmproj) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El repositorio es una conversion a GGUF de ggml-org-dev/tiny-d1-Omni-2B, que a su vez deriva de LiquidAI/d1-Omni-2B. La presencia de un fichero mmproj indica que el modelo base incorpora capacidad multimodal (proyeccion de entradas no textuales al espacio del modelo de lenguaje), pero no se detalla el tipo de encoder ni la modalidad concreta cubierta.

No hay datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones arquitectonicas. La model card indica explicitamente que se trata de una copia modificada y danada, generada unicamente para probar software, por lo que cualquier caracteristica del modelo original de Liquid AI puede haber sido alterada de forma no documentada.

## Capacidades

- El modelo no tiene capacidades funcionales utilizables: su salida es gibberish por diseno, segun advierte el autor.
- Presencia de proyector multimodal (mmproj) en el paquete GGUF, lo que sugiere soporte de entrada multimodal en el modelo base, aunque no verificable en esta copia.
- Integracion con llama.cpp: el repositorio existe para validar el tipo de decision `lfm3-d1-omni` del servidor de llama.cpp.
- Ejecutable mediante `llama-server -hf ggml-org-dev/tiny-d1-Omni-2B-GGUF:Q8_0`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue.

## Casos de uso

- Pruebas de integracion en llama.cpp: sirve como fixture para verificar que el servidor carga correctamente modelos GGUF con proyector multimodal asociado a la familia d1-Omni.
- Validacion del pipeline de conversion: permite comprobar que `convert_hf_to_gguf.py` y `llama-quantize` producen artefactos cargables a partir de un checkpoint HF con mmproj.
- Test de regresion del tipo de decision `lfm3-d1-omni`: los desarrolladores pueden ejecutar la suite del servidor sin depender del modelo completo de Liquid AI.
- CI/CD de llama.cpp: al ocupar apenas 0,1 GB, se puede descargar en pipelines automatizados con coste minimo de ancho de banda y almacenamiento.
- Verificacion de cuantizacion Q8_0: util para comprobar que el proceso de cuantizacion del texto preserva la estructura esperada por el runtime.
- Desarrollo de herramientas de inspeccion GGUF: un artefacto pequeno y conocido facilita probar parsers y utilidades de metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la salida del modelo es gibberish, por lo que cualquier evaluacion de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q8_0, dado el tamano del repo (0,1 GB) y los 34,5 millones de parametros.
- GPU recomendadas: cualquier GPU consumer con soporte CUDA, ROCm o Metal; tambien es viable en CPU.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090, etc.) e incluso en dispositivos de baja memoria.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio.
- Latencia y throughput: no disponibles; al ser un modelo de decenas de millones de parametros, la latencia seria muy baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| tiny-d1-Omni-2B-GGUF | 34,5 M (segun safetensors) | no disponible | GGUF | LFM Open License v1.0 | Fixture de test para llama.cpp |
| LiquidAI/d1-Omni-2B | no disponible | no disponible | safetensors (presumiblemente) | LFM Open License v1.0 | Modelo original de Liquid AI |
| ggml-org-dev/tiny-d1-Omni-2B | no disponible | no disponible | no disponible | LFM Open License v1.0 | Base intermedia del GGUF |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo genera gibberish de forma deliberada; no debe usarse para ninguna tarea productiva, de investigacion ni de evaluacion.
- Es una copia modificada y danada del modelo original de Liquid AI; sus pesos no representan el comportamiento del d1-Omni-2B real.
- La licencia LFM Open License v1.0 puede imponer restricciones adicionales al uso comercial; debe revisarse el fichero LICENSE antes de cualquier redistribucion.
- El nombre del repositorio sugiere 2B parametros, pero los safetensors declaran 34,5 millones; no debe asumirse el tamano indicado por el nombre.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion porque el modelo no es funcional.
- El campo `pipeline` no esta disponible, por lo que no se puede confirmar la tarea declarada en Hugging Face.
- Uso previsto exclusivamente en tests automatizados de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B-GGUF
- Modelo base intermedio: https://huggingface.co/ggml-org-dev/tiny-d1-Omni-2B
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/d1-Omni-2B
- Repositorio llama.cpp (herramientas de conversion y servidor): no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
