# jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-Q4

## Resumen

DiffusorRT-iPhone-Qwen3.5-4B-DFlash-Q4 es un artefacto de inferencia empaquetado por jimmylearnML para ejecutar en iPhone un modelo draft de tipo DFlash asociado a Qwen3.5-4B, cuantizado a 4 bits y compilado para el runtime DiffusorRT. No se trata de un checkpoint de Transformers ni de una aplicacion autonoma: es un modelo borrador opcional que requiere la instalacion separada del modelo objetivo DiffusorRT Qwen3.5-4B Q4 y que, por si solo, no puede responder consultas. Su relevancia es practica: permite acelerar la generacion en dispositivo movil mediante decodificacion especulativa con un draft pequeno, manteniendo el modelo objetivo de 4B como verificador.

El repositorio ocupa 0,3 GB y esta publicado con licencia MIT, derivado de z-lab/Qwen3.5-4B-DFlash. La model card es muy escueta y no aporta datos sobre arquitectura interna, composicion del entrenamiento, contexto o idiomas; se limita a indicar el uso previsto, la atribucion de pesos y la existencia de ficheros de licencia, aviso y checksums.

La ficha se basa unicamente en la informacion disponible en Hugging Face y en la model card. Cualquier dato no confirmado se marca como no disponible para evitar inferencias no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo draft DFlash para decodificacion especulativa; no se detalla la arquitectura interna) |
| Parametros totales | no disponible (asociado a la familia Qwen3.5-4B; el draft no declara recuento propio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (Q4) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | datos compilados para el runtime DiffusorRT (no es safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo draft. Por el nombre y las etiquetas (`diffusorrt`, `ios`, `4-bit`) y por la referencia a DFlash, se trata de un modelo borrador pensado para decodificacion especulativa junto a un modelo objetivo Qwen3.5-4B en el runtime DiffusorRT. El paquete contiene datos de modelo compilados para dicho runtime, no un checkpoint upstream de Transformers.

No se especifican tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF/DPO) ni innovaciones adicionales. La model card unicamente atribuye los pesos originales a z-lab/Qwen3.5-4B-DFlash en una revision concreta y remite a los ficheros LICENSE, NOTICE e `iphone-pack.json` para checksums.

## Capacidades

- Generacion especulativa como modelo draft: propone tokens que el modelo objetivo DiffusorRT Qwen3.5-4B Q4 verifica, acelerando la decodificacion en iPhone.
- No responde de forma autonoma: requiere el modelo objetivo instalado por separado.
- Ejecucion en dispositivo movil iOS mediante el runtime DiffusorRT.
- Cuantizacion 4-bit orientada a reducir huella de memoria en telefono.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion.

## Casos de uso

- Aceleracion de inferencia en iPhone: se usa como draft junto al objetivo Qwen3.5-4B Q4 para reducir la latencia percibida en generacion de texto en el dispositivo, aprovechando la verificacion del modelo objetivo.
- Asistentes offline en movil: integrado en una app iOS basada en DiffusorRT, permite generar respuestas sin conexion a un servidor, manteniendo los datos en el telefono.
- Prototipado de decodificacion especulativa en edge: sirve para evaluar el equilibrio entre velocidad y calidad al combinar un draft 4-bit con un objetivo de 4B en hardware movil.
- Reduccion de consumo energetico en generacion larga: al disminuir el numero de pasos efectivos del modelo objetivo, puede rebajar el coste computacional en tareas de dictado o resumen en el telefono.
- Pruebas de integracion del runtime DiffusorRT: util para desarrolladores que validan el empaquetado de modelos compilados y los checksums del paquete en iOS.
- Evaluacion comparativa de drafts: permite medir la tasa de aceptacion del draft frente al objetivo en distintos prompts y dispositivos, aunque los resultados son especificos de cada dispositivo y prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: no disponible de forma explicita; el repo ocupa 0,3 GB y el modelo esta cuantizado a 4 bits, pero requiere ademas el objetivo DiffusorRT Qwen3.5-4B Q4 instalado.
- GPU recomendadas: no aplica a GPU de servidor; el destino es iPhone con el runtime DiffusorRT.
- Compatibilidad con GPU de consumo: no disponible; el empaquetado es para iOS, no para CUDA.
- Opciones de despliegue: runtime DiffusorRT en iOS; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card advierte que los resultados de hardware, cuando se reportan, son especificos del dispositivo y del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Destino |
|---|---|---|---|---|---|
| DiffusorRT-iPhone-Qwen3.5-4B-DFlash-Q4 | no disponible (draft para Qwen3.5-4B) | no disponible | 4-bit | MIT | iOS (DiffusorRT) |
| z-lab/Qwen3.5-4B-DFlash (base) | no disponible | no disponible | no disponible | no disponible | checkpoint upstream |
| DiffusorRT Qwen3.5-4B Q4 (objetivo requerido) | 4B (familia) | no disponible | 4-bit | no disponible | iOS (DiffusorRT) |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo DiffusorRT Qwen3.5-4B Q4 instalado no puede responder.
- No es una aplicacion ni un checkpoint de Transformers; es un paquete de datos compilados para DiffusorRT.
- Solo se ha ejercitado la entrada nativa de telefono en Mac, segun la model card; el comportamiento en dispositivos reales puede variar.
- Los resultados de hardware son especificos de cada dispositivo y prompt; no deben generalizarse.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limites de contexto.
- Licencia MIT declarada, pero conviene revisar LICENSE y NOTICE del repositorio y la licencia del modelo base para uso comercial.
- Verificar los checksums de `iphone-pack.json` antes de desplegar el paquete.

## Enlaces

- Hugging Face: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-Q4
- Modelo base: https://huggingface.co/z-lab/Qwen3.5-4B-DFlash/tree/96899cc270945f554998309580b08a04a05a3187
- Checksums del paquete: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-Q4/blob/main/iphone-pack.json
- Licencia: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-Q4/blob/main/LICENSE
- Aviso: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3.5-4B-DFlash-Q4/blob/main/NOTICE
