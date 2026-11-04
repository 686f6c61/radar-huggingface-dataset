# qq2671016745/paimind-models

## Resumen

`paimind-models` no es un modelo entrenado desde cero, sino un repositorio de distribucion de pesos de terceros empaquetados para una aplicacion concreta: paimind, un asistente de decision con arquitectura "local-first". El autor (usuario `qq2671016745`) publica en este repositorio las copias de los modelos Qwen2.5-0.5B-Instruct y Qwen2.5-1.5B-Instruct en formato Hugging Face, junto con una cuantizacion GGUF INT4 del modelo de 1.5B, organizadas en dos niveles de capacidad (L0 y L1) que la aplicacion cliente selecciona segun la potencia del dispositivo.

El valor del repositorio es, por tanto, operativo y no cientifico: actua como espejo de distribucion para que el cliente paimind descargue los pesos desde Hugging Face mediante un proveedor configurado. No hay entrenamiento propio, ni fine-tuning, ni modificacion de los pesos originales; la model card indica explicitamente que se trata de los pesos originales de Qwen2.5 Instruct sin reescritura de cuantizacion (salvo el fichero GGUF derivado).

La relevancia es limitada fuera del ecosistema paimind. Para un desarrollador o investigador que busque un modelo, lo relevante es el modelo subyacente (Qwen2.5 Instruct en 0.5B y 1.5B), no este repositorio. La informacion publica del repositorio no incluye pipeline, licencia declarada, idiomas ni metricas, por lo que la evaluacion tecnica debe remitirse a las fichas oficiales de Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5, pesos originales de terceros) |
| Parametros totales | 0,5B (L0) y 1,5B (L1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en este repositorio (depende de la configuracion de Qwen2.5 subyacente) |
| Tipos de cuantizacion | FP original en safetensors (L0 y L1) y GGUF Q4_K_M (solo L1) |
| Idiomas soportados | no disponible en este repositorio |
| Licencia | no disponible en este repositorio |
| Formato de pesos | safetensors (formato Hugging Face) y GGUF (INT4, L1) |

## Arquitectura y entrenamiento

El repositorio no define arquitectura ni entrenamiento propios: redistribuye los pesos de Qwen2.5-0.5B-Instruct y Qwen2.5-1.5B-Instruct, modelos transformer decoder-only de la familia Qwen2.5. La model card afirma que son "los pesos originales de Qwen2.5 Instruct, sin reescritura de cuantizacion", es decir, no hay fine-tuning, destilacion ni ajuste por RLHF adicional por parte del autor del repositorio. Cualquier innovacion tecnica (atencion, tokenizador, datos de preentrenamiento, alineamiento) corresponde al modelo Qwen2.5 original y no se documenta aqui.

La unica aportacion tecnica del repositorio es el empaquetado: una jerarquia de dos niveles (L0 con 0,5B y L1 con 1,5B) para que la aplicacion elija el modelo segun recursos, y una conversion a GGUF Q4_K_M para el modo llama.cpp. La model card senala ademas que el modo `builtin` de la app basado en ONNX INT4 no esta cubierto por este repositorio, lo que deja un hueco funcional para despliegues que dependan de ese formato.

## Capacidades

- Generacion de texto conversacional en los dos niveles de modelo (0,5B y 1,5B), heredadas de Qwen2.5 Instruct.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano reducido de ambos modelos.
- Generacion de codigo y matematicas sencillas, con calidad esperable de modelos de 0,5B-1,5B.
- Soporte de tool calling y function calling segun las capacidades del Qwen2.5 Instruct subyacente (no verificado en este repositorio).
- Capacidades multilingues segun Qwen2.5 (no declaradas en este repositorio).
- Inferencia local en CPU/GPU de gama baja gracias al nivel L0 y al fichero GGUF INT4 del nivel L1.
- No incluye vision, audio ni modo de razonamiento extendido (thinking) declarado en este repositorio.

## Casos de uso

- Asistente de decision local-first: la aplicacion paimind usa el nivel L0 (0,5B) en dispositivos con poca memoria y el nivel L1 (1,5B) cuando hay recursos, manteniendo los datos en el dispositivo.
- Despliegue en portatiles sin GPU dedicada: el fichero GGUF Q4_K_M del modelo de 1,5B permite ejecucion en CPU con llama.cpp, adecuado para entornos de escritorio.
- Servicio de inferencia con vLLM en servidor modesto: los pesos en formato Hugging Face de L0 y L1 se cargan directamente en vLLM para atender peticiones concurrentes de baja latencia.
- Clasificacion y extraccion de informacion en texto corto: tareas de etiquetado, resumen de una frase o extraccion de entidades donde un modelo de 0,5B-1,5B es suficiente y el coste por token es minimo.
- Prototipado rapido de pipelines de agentes: el soporte de tool calling de Qwen2.5 permite probar flujos multi-paso con un modelo pequeno antes de escalar a uno mayor.
- Entornos con requisitos de privacidad: al ejecutarse localmente y no requerir llamadas a API externas, encaja en escenarios donde el texto no puede salir del dispositivo.
- Base para experimentos de cuantizacion: el par de pesos originales (L1 safetensors) y su version GGUF Q4_K_M permite comparar calidad entre FP y INT4 en el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas propias ni referencias a evaluaciones de los pesos redistribuidos.

## Requisitos de hardware

- VRAM estimada para L0 (0,5B) en FP16: en torno a 1-1,5 GB, incluyendo overhead de runtime.
- VRAM estimada para L1 (1,5B) en FP16: en torno a 3-4 GB, incluyendo overhead de runtime.
- VRAM estimada para L1 en GGUF Q4_K_M: en torno a 1-1,5 GB, ejecutable en CPU con llama.cpp.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas para L1 en FP16 (GTX 1650, RTX 3050, RTX 4060); para L0 basta con 2 GB. En servidor, A100/H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en ambos niveles; L1 en Q4_K_M puede ejecutarse incluso sin GPU dedicada.
- Opciones de despliegue: vLLM (pesos Hugging Face de L0 y L1), llama.cpp (GGUF Q4_K_M de L1), Ollama u otros runners compatibles con GGUF. El modo ONNX INT4 de la app no esta cubierto por este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| paimind-models (L1) | 1,5B | no disponible | no disponible | safetensors, GGUF Q4_K_M | Redistribucion de Qwen2.5-1.5B-Instruct |
| Qwen2.5-1.5B-Instruct (oficial) | 1,5B | no disponible aqui | Apache 2.0 (segun ficha oficial de Qwen) | safetensors, GGUF | Fuente original; incluye model card y evaluaciones |
| Qwen2.5-0.5B-Instruct (oficial) | 0,5B | no disponible aqui | Apache 2.0 (segun ficha oficial de Qwen) | safetensors, GGUF | Alternativa de menor coste para el mismo proposito |
| SmolLM2-1.7B-Instruct | 1,7B | no disponible aqui | Apache 2.0 (segun ficha oficial) | safetensors, GGUF | Modelo pequeno alternativo para inferencia local |

La comparativa se limita a parametros y formato porque el repositorio no publica contexto, licencia ni evaluaciones propias. Para decisiones de produccion conviene consultar las fichas oficiales de los modelos subyacentes.

## Limitaciones y advertencias

- El repositorio no declara licencia; la licencia aplicable es la del modelo Qwen2.5 subyacente, que debe verificarse en su ficha oficial antes de uso comercial.
- No se documentan sesgos, idiomas soportados ni evaluaciones de seguridad en este repositorio.
- Riesgo de alucinacion elevado por el tamano reducido de los modelos (0,5B y 1,5B), especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- El nivel L0 (0,5B) es adecuado solo para tareas muy acotadas; no debe usarse para generacion abierta de alta calidad.
- El repositorio no incluye el grafo ONNX INT4 que requiere el modo `builtin` de la app paimind, por lo que ese modo queda sin soporte desde esta fuente.
- La fecha de creacion indicada (2026-11-04) y la ausencia de descargas y likes sugieren un repositorio recien publicado y sin validacion de la comunidad; no hay garantia de mantenimiento.
- No hay informacion sobre contexto maximo efectivo en este empaquetado; debe confirmarse en la configuracion de los pesos cargados.
- Para produccion, conviene usar los repositorios oficiales de Qwen2.5 en lugar de esta redistribucion, salvo que se dependa especificamente del cliente paimind.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qq2671016745/paimind-models
- Modelo subyacente L0 (referencia): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo subyacente L1 (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5 (referencia): https://github.com/QwenLM/Qwen2.5
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales asociados a paimind.
