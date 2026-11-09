# Orange-3DV-Team/mozoo-debug

## Resumen

`mozoo-debug` es un repositorio de modelos alojado en Hugging Face por el equipo Orange-3DV-Team, con licencia Apache 2.0 y acceso restringido (gated), lo que obliga a aceptar condiciones en la plataforma antes de descargar los pesos. El repositorio ocupa 16,8 GB, un tamano compatible con un modelo denso de orden de 7 a 8 mil millones de parametros almacenado en precision de 16 bits, aunque esta estimacion no puede confirmarse porque la informacion disponible no incluye la ficha tecnica del modelo.

La informacion publica es extremadamente limitada: no se especifican arquitectura, parametros, contexto, idiomas ni pipeline de inferencia. El sufijo "debug" en el nombre sugiere que se trata de un artefacto de depuracion o de un checkpoint de trabajo interno del equipo, mas que de un modelo publicado para uso general. Dado que el repositorio esta gated y no dispone de descargas ni interacciones registradas, cualquier evaluacion practica exige solicitar acceso y revisar los archivos (`config.json`, `tokenizer_config.json`, pesos) antes de integrarlo en un pipeline.

Esta ficha documenta exclusivamente lo que puede verificarse a partir de los metadatos del repositorio; el resto de campos se marcan como no disponibles para no inducir a error a quien vaya a evaluar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (tamano del repo: 16,8 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se detalla en la informacion proporcionada) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura, composicion del dataset de entrenamiento, numero de tokens procesados ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado. El unico dato objetivo es el tamano del repositorio (16,8 GB), que orienta hacia un modelo de escala media-alta en pesos de 16 bits, pero sin `config.json` accesible no es posible confirmar familia arquitectonica (transformer denso, MoE o hibrido) ni dimensiones de capas, cabezas de atencion o embedding.

El nombre del repositorio y el prefijo del autor (Orange-3DV-Team) apuntan a un equipo vinculado a vision 3D, lo que podria implicar un modelo multimodal o un componente auxiliar de un pipeline de reconstruccion 3D. Esta hipotesis no esta respaldada por metadatos explicitos y debe verificarse tras obtener acceso al repositorio.

## Capacidades

- No se dispone de documentacion sobre capacidades de generacion de texto, razonamiento, codigo o matematicas.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- Cobertura multilingue no disponible.
- No se documentan modos especiales (thinking mode, vision, audio, decodificacion especulativa).

## Casos de uso

- Auditoria de checkpoints internos: el repositorio puede servir para inspeccionar la evolucion de un modelo en desarrollo dentro del equipo, comparando pesos y configuracion entre iteraciones de depuracion.
- Reproducibilidad de experimentos: al estar bajo licencia Apache 2.0 y con acceso controlado, permite reconstruir resultados internos de investigacion en vision 3D sin exponer los pesos a terceros no autorizados.
- Base para fine-tuning controlado: si tras solicitar acceso se confirma una arquitectura transformer estandar, podria adaptarse con LoRA o QLoRA a tareas especificas del dominio 3D, sujeto a validacion previa de la licencia y de las condiciones de acceso.
- Evaluacion comparativa interna: util como referencia negativa o de control frente a modelos publicados, midiendo diferencias de perplexity o calidad en tareas del dominio del equipo.
- Pruebas de infraestructura de despliegue: un repositorio de 16,8 GB permite validar pipelines de descarga, conversion a GGUF y carga en vLLM o TGI antes de mover modelos definitivos a produccion.
- Integracion en pipelines de vision 3D: si el modelo resulta ser multimodal, podria emplearse como modulo de descripcion de escenas o de generacion de texto asociado a reconstrucciones, previa verificacion de sus entradas y salidas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; como referencia orientativa, un modelo denso de ~8B en FP16 requiere del orden de 16 GB de VRAM solo para pesos, mas cache KV, pero esta cifra no puede confirmarse sin conocer la configuracion real.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dependeria del numero real de parametros y de la disponibilidad de cuantizaciones GGUF o AWQ, que no se documentan.
- Opciones de despliegue: no disponible (no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no permite identificar la categoria del modelo (texto, vision, multimodal o componente 3D), por lo que no es posible establecer comparaciones fiables con alternativas de la misma familia o tamano.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a cualquier evaluacion automatizada o integracion en CI/CD.
- Ausencia de documentacion tecnica: sin model card detallada, no es posible garantizar comportamiento, tokenizer, formato de prompt ni limites de contexto.
- Sufijo "debug": el nombre sugiere un artefacto de depuracion, con posible inestabilidad, pesos incompletos o configuracion no definitiva; no debe tratarse como un modelo listo para produccion sin validacion.
- Riesgo de alucinacion y sesgos: no evaluable con los datos disponibles.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones adicionales impuestas por el acceso gated, que pueden anadir restricciones de uso.
- Cero descargas y cero interacciones registradas: no existe evidencia de uso por parte de la comunidad, lo que reduce la probabilidad de encontrar soporte o incidencias documentadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Orange-3DV-Team/mozoo-debug
