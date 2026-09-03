# jnc4/please-weights

## Resumen

El repositorio `jnc4/please-weights` no contiene un modelo de lenguaje independiente, sino un paquete de pesos cuantizados de los modelos Qwen2.5-0.5B y Qwen2.5-0.5B-Instruct, preparado específicamente para el proyecto artístico [PLEASE](https://juliuschandler.com/art), una pieza de arte en navegador que ejecuta ambos modelos mediante un forward pass propio escrito en WGSL (WebGPU Shading Language). El autor, jnc4, ha cuantizado ambos modelos a int8 con escalas simétricas de grupo 64 (formato `please-int8-g64/2`) y los ha empaquetado en 22 shards más un manifiesto con hashes sha256, totalizando 1.019.367.424 bytes.

Este paquete no está pensado como checkpoint de propósito general: su estructura de layout es específica del cargador de la pieza PLEASE. Para usos convencionales de Qwen2.5-0.5B, el propio autor remite a los repositorios oficiales de Qwen. La relevancia de este repositorio es, por tanto, exclusivamente como artefacto de distribución para un proyecto artístico que necesita preservar la diferencia de logits entre el modelo base y el instruct, motivo por el cual se eligió int8 en lugar de int4 y se mantuvo una estructura de cuantización idéntica en ambos modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-0.5B base e instruct) |
| Parametros totales | 0.5 mil millones (por modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 con escalas simetricas de grupo 64 (formato `please-int8-g64/2`) |
| Idiomas soportados | no disponible (hereda los del modelo base, no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | 22 shards + manifiesto con sha256; formato especifico del cargador PLEASE (no safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento

El paquete contiene dos modelos: Qwen2.5-0.5B (base) y Qwen2.5-0.5B-Instruct, ambos de la familia Qwen2.5. No se ha realizado ningun entrenamiento adicional; se trata de una cuantizacion posterior de los pesos originales a int8 con escalas simetricas por grupo de 64 canales. La eleccion de int8 (en lugar de int4) responde a la necesidad de preservar la diferencia de logits entre el modelo base y el instruct, que es esencial para el funcionamiento de la pieza PLEASE. Ambos modelos se cuantizan con la misma estructura de grupo para que la comparacion de logits sea consistente. El layout de los shards esta disenado para el cargador especifico de la pieza, no para frameworks de inferencia estandar.

## Capacidades

- No es un modelo autonomo: es un paquete de pesos cuantizados para un proyecto concreto.
- Las capacidades teoricas son las de Qwen2.5-0.5B (generacion de texto, razonamiento basico, codigo, matematicas, multilingue), pero el autor advierte explicitamente que no es util como checkpoint de proposito general.
- El unico proposito es ejecutar el forward pass de ambos modelos en el navegador via WGSL, dentro de la pieza PLEASE.
- No se documenta soporte para tool calling, agentes, vision ni otras capacidades especiales.

## Casos de uso

- Pieza de arte generativa en navegador: el caso de uso unico y documentado. La pieza PLEASE ejecuta ambos modelos (base e instruct) en paralelo mediante un forward pass WGSL, y la diferencia de logits entre ambos se utiliza como parte de la logica artistica. El paquete de pesos esta optimizado para este fin.
- No se recomienda ningun otro caso de uso. Para aplicaciones convencionales de Qwen2.5-0.5B, se debe utilizar el repositorio oficial de Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento, y al ser un paquete de pesos especifico para un proyecto artistico, no se han evaluado capacidades generales.

## Requisitos de hardware

- No se proporcionan requisitos de hardware especificos en la informacion disponible.
- Dado que el modelo base es de 0.5B y la cuantizacion es int8, el paquete es ligero (1 GB en disco) y puede ejecutarse en GPU de consumo o incluso en CPU, pero no hay datos de VRAM ni latencia.
- El proyecto PLEASE se ejecuta en navegador mediante WebGPU (WGSL), por lo que requiere un navegador compatible con WebGPU y una GPU que lo soporte.
- No se mencionan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI, y no serian aplicables debido al formato de pesos propietario.

## Comparativa con modelos similares

No procede una comparativa con modelos de la misma categoria, ya que este repositorio no es un modelo de proposito general. La unica comparacion relevante es con el modelo original Qwen2.5-0.5B, del cual deriva:

| Modelo | Parametros | Cuantizacion | Licencia | Uso |
|---|---|---|---|---|
| Qwen2.5-0.5B (original) | 0.5B | FP16/BF16 | Apache-2.0 | Proposito general |
| jnc4/please-weights | 0.5B (x2) | int8 g64 | Apache-2.0 | Exclusivo para PLEASE |

## Limitaciones y advertencias

- No es un checkpoint de proposito general: el layout de los shards es especifico del cargador de PLEASE y no es compatible con frameworks de inferencia estandar.
- El autor recomienda usar los repositorios oficiales de Qwen para cualquier uso normal.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto, pero al ser un paquete de pesos sin evaluacion, no se puede garantizar su comportamiento fuera del contexto de la pieza.
- La licencia Apache-2.0 permite uso comercial, pero el formato propietario limita su aplicabilidad practica.
- No hay soporte ni mantenimiento: el repositorio tiene 0 descargas y 0 likes, y no se indica ninguna intencion de actualizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jnc4/please-weights
- Repositorio GitHub del proyecto PLEASE: https://github.com/JNC4/please
- Sitio del proyecto PLEASE: https://juliuschandler.com/art
