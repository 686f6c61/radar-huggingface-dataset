# JacobLinCool/the-net

## Resumen

The Net es una arquitectura multimodal a escala de 20 billones de parametros (20,09T) publicada por JacobLinCool bajo licencia MIT. Cubre cinco modalidades de entrada —texto, audio, imagen, video y senales EEG— mediante codificadores especificos que convergen en un nucleo compartido de mezcla de expertos (MoE) disperso y jerarquico con memoria recurrente, del que cuelgan cabezas y decodificadores para generar cada modalidad de salida. El modelo combina atencion, expertos SwiGLU y RMSNorm en tres anchos de capa (8.192, 12.288 y 16.384) repartidos en 686 bloques.

El dato critico para evaluar el repositorio es que sus pesos son una inicializacion constante: el modelo no ha sido entrenado. Se publica como andamiaje de arquitectura y referencia de implementacion (`OmniConfig` y `OmniModel` en `modeling_omni.py`), no como modelo utilizable para inferencia real. El repositorio ocupa 0,4 GB pese a declarar 20,18 billones de parametros, lo que confirma que no contiene pesos densos completos sino una representacion comprimida y compartida.

Su relevancia ahora es la de un experimento de escalado extremo y comparticion de pesos: propone una topologia unica para cinco modalidades con 128 expertos por capa y enrutamiento top-2, y documenta el formato de publicacion y el conteo de parametros en `EXPERIMENT.md`. Resulta interesante como referencia de diseno y para estudiar tecnicas de compresion de checkpoints a gran escala, no como base sobre la que construir productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con nucleo MoE disperso jerarquico y memoria recurrente (`the_net_omni`) |
| Parametros totales | 20.186.399.438.585 (20,09T declarados en model card) |
| Parametros activos | No disponible (top-2 de 128 expertos por capa; el numero exacto de parametros activos no se publica) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en 8 bits con `compressed-tensors`; no se documentan otros formatos |
| Idiomas soportados | No disponible (tokenizador byte-level, sin lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (repo de 0,4 GB), mas `config.json`, `tokenizer.json` y `tensor_shapes.json` |
| Bloques atencion/FFN | 686 |
| Anchos del nucleo | 8.192 / 12.288 / 16.384 |
| Expertos | 128 por capa, enrutamiento top-2 |
| Tokenizador | Byte-level |
| Estado de los pesos | Inicializacion constante (sin entrenar) |
| Modalidades | Texto, audio, imagen, video y EEG |

## Arquitectura y entrenamiento

La arquitectura se organiza en 11 componentes mayores: cinco codificadores de modalidad, una etapa de fusion multiescala, un modelo de mundo compartido, tres decodificadores de media y un controlador de memoria. Cada codificador combina un stem especifico de modalidad con chunking, pooling y dechunking aprendidos; la fusion alinea las representaciones antes de entrar al nucleo. El nucleo es un MoE disperso jerarquico con atencion, expertos SwiGLU y RMSNorm distribuidos en tres anchos, con caminos residuales de detalle que conectan niveles de la jerarquia y una memoria recurrente que transporta estado entre segmentos.

Las interfaces por modalidad estan definidas de forma explicita: texto con tokens byte-level y logits de siguiente token; audio con tramas de forma de onda, caracteristicas espectrales y logits de codebook; imagen con parches RGB y latentes; video con tubelets espaciotemporales y latentes; EEG con senales multicanal y adyacencia de electrodos. No se han publicado datos de entrenamiento: no hay numero de tokens, composicion del dataset ni fases de RLHF o DPO. La model card indica literalmente que los pesos son de inicializacion constante y no estan entrenados, por lo que no existe ninguna innovacion de decodificacion especulativa, atencion lineal ni ajuste fino documentada.

## Capacidades

- Generacion de texto a nivel de arquitectura: cabeza de texto con tokens byte-level y logits de siguiente token (sin pesos entrenados, por lo que no produce salida coherente).
- Procesamiento de audio: entrada de tramas de forma de onda y caracteristicas espectrales, salida mediante decodificador de audio con logits de codebook.
- Vision: entrada de parches RGB, salida mediante decodificador de imagen a latentes.
- Video: entrada de tubelets espaciotemporales, salida mediante decodificador de video.
- Senales EEG: entrada multicanal con matriz de adyacencia de electrodos.
- Fusion multimodal: alineacion de representaciones de las cinco modalidades en un espacio compartido antes del nucleo.
- Memoria recurrente: transporte de estado entre segmentos de una secuencia.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el tokenizador es byte-level y no hay lista de idiomas.

## Casos de uso

- Referencia de arquitectura para investigacion multimodal: el repositorio sirve para estudiar como se conectan cinco codificadores de modalidad con un nucleo MoE compartido y una etapa de fusion multiescala, reutilizable como esqueleto en proyectos propios.
- Estudio de comparticion de pesos a escala extrema: el checkpoint de 0,4 GB para 20,18T de parametros permite analizar tecnicas de compresion y layout de almacenamiento descritas en `EXPERIMENT.md`.
- Base para experimentos de enrutamiento MoE: con 128 expertos por capa y top-2, es un banco de pruebas para politicas de enrutamiento y balanceo de carga antes de invertir en entrenamiento.
- Prototipado de pipelines multimodales: las interfaces por modalidad (parches RGB, tubelets, tramas de audio, canales EEG) permiten validar el preprocesado y las formas de tensor sin coste de inferencia real.
- Docencia y divulgacion: util para explicar en un curso la diferencia entre parametros totales y activos, y el impacto del diseno MoE en el coste de inferencia.
- Evaluacion de tooling de transformers: al usar `custom_code` y `compressed-tensors`, sirve para probar la carga de modelos con codigo personalizado y pesos de 8 bits en entornos de CI.
- Auditoria de licencias: al ser MIT, se puede usar como componente en prototipos internos sin las restricciones de licencias comunitarias con clausulas de uso aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no esta entrenado, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de sentido en este estado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 20,18T de parametros, incluso en 8 bits el modelo completo requeriria del orden de terabytes de memoria; el checkpoint de 0,4 GB no representa los pesos densos completos.
- GPU recomendadas: no disponible. No hay configuracion de despliegue validada ni datos de rendimiento.
- Viabilidad en GPU de consumo: no. El tamano declarado excede con creces cualquier GPU consumer (RTX 4090, 24 GB) e incluso nodos multi-GPU convencionales.
- Opciones de despliegue: `transformers` con `custom_code` (`OmniConfig` / `OmniModel`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de 20T parametros con cobertura de cinco modalidades y pesos sin entrenar; las alternativas multimodales abiertas habituales son ordenes de magnitud menores y estan entrenadas, por lo que la comparacion no seria homogenea.

## Limitaciones y advertencias

- Los pesos son una inicializacion constante y no estan entrenados: el modelo no genera texto, audio, imagen ni video coherentes. No debe usarse en produccion bajo ninguna circunstancia.
- El repositorio de 0,4 GB no contiene los pesos densos de un modelo de 20,18T; el conteo de parametros corresponde a la arquitectura declarada, no a tensores materializados al uso.
- No hay informacion sobre datos de entrenamiento, por lo que no se pueden evaluar sesgos; al no estar entrenado, tampoco se han medido.
- Riesgo de alucinacion: no aplicable en el sentido habitual, ya que no hay capacidad generativa entrenada; el riesgo real es interpretar mal el repositorio como un modelo funcional.
- Longitud de contexto, idiomas y parametros activos no documentados: impide planificar costes de inferencia o evaluar capacidades multilingues.
- La licencia MIT permite uso comercial del codigo y los pesos publicados, pero al no haber modelo entrenado no hay valor comercial directo en el checkpoint.
- El uso de `custom_code` implica ejecutar codigo del autor al cargar el modelo; conviene auditar `modeling_omni.py` antes de integrarlo en pipelines automatizados.
- Los pesos en 8 bits con `compressed-tensors` pueden requerir versiones concretas de `transformers` y de la libreria de compresion; no se especifican versiones minimas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JacobLinCool/the-net
- `EXPERIMENT.md` (formato de publicacion y conteo de parametros): https://huggingface.co/JacobLinCool/the-net/blob/main/EXPERIMENT.md
- Implementacion del modelo (`modeling_omni.py`): https://huggingface.co/JacobLinCool/the-net/blob/main/modeling_omni.py
- Configuracion (`configuration_omni.py`): https://huggingface.co/JacobLinCool/the-net/blob/main/configuration_omni.py
- Formas de tensor (`tensor_shapes.json`): https://huggingface.co/JacobLinCool/the-net/blob/main/tensor_shapes.json
