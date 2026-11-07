# DQN-Labs/17btest-nov6-2x16k

## Resumen

DQN-Labs/17btest-nov6-2x16k es un modelo de generacion de texto publicado en Hugging Face por el usuario DQN-Labs. Se distribuye en formato `safetensors` bajo la libreria `transformers` y lleva la etiqueta de arquitectura `lfm3`, lo que lo vincula a la familia de modelos LFM (Liquid Foundation Models) de Liquid AI. El repositorio ocupa 3,5 GB y contiene 1.728.801.536 parametros totales segun los metadatos de safetensors, es decir, aproximadamente 1,7 mil millones de parametros.

El nombre del repositorio (`17btest-nov6-2x16k`) sugiere un experimento de entrenamiento con un contexto de 16 000 tokens y un tamano cercano a 1,7B, aunque no hay documentacion que lo confirme. La model card es la plantilla autogenerada por Hugging Face y no aporta informacion sobre datos de entrenamiento, idiomas, licencia ni evaluacion. Las etiquetas `trl` y `sft` indican que el checkpoint se ha sometido a un ajuste fino supervisado (SFT) mediante la libreria TRL.

Se trata, por tanto, de un checkpoint de investigacion con muy poca trazabilidad: cero descargas, cero valoraciones y ningun benchmark publicado. Resulta relevante unicamente como referencia para quienes siguen los experimentos de DQN-Labs con la arquitectura LFM3, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm3 (familia LFM de Liquid AI; detalles no disponibles) |
| Parametros totales | 1.728.801.536 (aprox. 1,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el nombre del repo sugiere 16k, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers (con `custom_code`) |
| Tamano del repositorio | 3,5 GB |
| Metodo de ajuste | SFT con TRL |

## Arquitectura y entrenamiento

La etiqueta `lfm3` apunta a la tercera generacion de la arquitectura LFM de Liquid AI, aunque la model card no describe la arquitectura interna ni confirma si se trata de un transformer convencional, un modelo de estado recurrente o una arquitectura hibrida. El campo `custom_code` en los tags indica que la carga requiere codigo remoto del repositorio, algo habitual en arquitecturas no estandar integradas en `transformers`.

El unico dato de entrenamiento disponible es que se ha aplicado un ajuste fino supervisado (SFT) con TRL. No se especifican el modelo base, el volumen de tokens de entrenamiento, la composicion del dataset, el regimen de precision ni si hubo etapas de RLHF o DPO. El sufijo `2x16k` del identificador podria referirse a una configuracion de contexto de 16 000 tokens duplicada, pero es una inferencia no verificada.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y la pipeline `text-generation`.
- Ajuste orientado a instrucciones mediante SFT, lo que en principio habilita el seguimiento de prompts.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- No hay evidencia documentada de soporte de tool calling, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Cobertura multilingue no disponible.
- Capacidades de codigo y matematicas no documentadas.

## Casos de uso

- Experimentacion con la arquitectura LFM3: el modelo sirve para reproducir y analizar el comportamiento de un checkpoint LFM3 de 1,7B en tareas de generacion, comparandolo con versiones anteriores del mismo autor.
- Evaluacion de pipelines SFT con TRL: util para investigadores que quieran inspeccionar como afecta el ajuste supervisado a un modelo base de esta familia.
- Pruebas de integracion con `transformers`: al requerir `custom_code`, permite validar el flujo de `trust_remote_code` y la carga de arquitecturas personalizadas en entornos controlados.
- Prototipado de asistentes conversacionales simples en local: con 1,7B de parametros cabe en GPUs de consumo en precision reducida, lo que facilita demos sin infraestructura dedicada.
- Benchmarking interno de contextos largos: si se confirma la ventana de 16k sugerida por el nombre, sirve para medir degradacion de calidad en conversaciones multi-turno extensas.
- Estudio de sesgos y alucinacion en modelos pequenos: al no tener filtros documentados, es un candidato para analisis de comportamiento en condiciones de baja supervision.
- Base para ajustes posteriores: al estar ya sometido a SFT, puede emplearse como punto de partida para fine-tunes especificos en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,5 GB solo para pesos, mas memoria para KV cache y activaciones; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, cerca de 1 GB, aunque no se distribuyen pesos GGUF y habria que generarlos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias por tamano, pero acelerarian el throughput en lote.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en precision completa y en 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via principal; la conversion a GGUF para llama.cpp u Ollama requeriria trabajo adicional al no publicarse artefactos de ese tipo. vLLM y TGI dependerian de que la arquitectura `custom_code` sea compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DQN-Labs/17btest-nov6-2x16k | 1,7B | no disponible (sugerido 16k) | no disponible | Hugging Face, safetensors |
| DQN-Labs/17btest-nov2-16k | aprox. 2B (segun busqueda) | 16k (segun nombre) | no disponible | Hugging Face |
| Alternativas LFM3 oficiales de Liquid AI | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni uso previsto.
- Licencia no especificada: no puede asumirse uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo elevado de alucinacion y respuestas inconsistentes al no documentarse el proceso de alineacion mas alla de un SFT generico.
- Idiomas soportados desconocidos: no hay garantia de calidad en castellano ni en otros idiomas distintos del que se uso en el ajuste.
- Longitud de contexto no confirmada: el sufijo `2x16k` es solo una pista, no un dato verificado.
- Requiere `trust_remote_code`: la carga ejecuta codigo del repositorio, lo que introduce un riesgo de seguridad que debe evaluarse en entornos aislados.
- Cero descargas y cero valoraciones: no hay evidencia de uso por terceros que permita validar su comportamiento.
- Nombre de repositorio tipo "test": sugiere un checkpoint experimental sin garantia de mantenimiento ni versiones estables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DQN-Labs/17btest-nov6-2x16k
- Perfil del autor en Hugging Face: https://huggingface.co/DQN-Labs/models
- Modelo relacionado (17btest-nov2-16k): https://huggingface.co/DQN-Labs/17btest-nov2-16k
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
