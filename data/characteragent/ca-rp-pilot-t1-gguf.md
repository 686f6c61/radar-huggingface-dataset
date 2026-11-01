# characteragent/ca-rp-pilot-t1-gguf

## Resumen

ca-rp-pilot-t1 es un ajuste fino por LoRA del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario characteragent y publicado unicamente como artefacto GGUF cuantizado (Q4_0 con imatrix). El modelo esta especializado en roleplay conversacional y se construyo a partir de chats sinteticos de role-play en los que el bloque de "thinking" contiene un breve resumen de la escena. Su tamano total es de 1.728.801.600 parametros, lo que lo situa en la gama de modelos pequenos aptos para inferencia en CPU y GPU de consumo.

El autor lo etiqueta explicitamente como una compilacion de prueba interna ("test pilot"), no como un lanzamiento: advierte de que no debe usarse en produccion. Esta es la advertencia mas importante de toda la ficha y condiciona cualquier evaluacion posterior. La relevancia del modelo es, por tanto, limitada: sirve como referencia de como se construye un ajuste de roleplay sobre LFM3 y como ejemplo de empaquetado GGUF con imatrix, pero no como candidato serio para despliegues.

La arquitectura subyacente es la de LFM3-1.7B de Liquid AI, un transformer de 1.700 millones de parametros con licencia LFM Open License v1.0. El ajuste anade un comportamiento conversacional de personaje y un modo de razonamiento opcional (thinking on/off) heredado del template de chat del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM3-1.7B); ajuste fino por LoRA fusionado |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 con imatrix (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF (`ca-rp-pilot-t1-Q4_0.gguf`, 1.049.615.264 bytes) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B, el transformer de 1.700 millones de parametros de Liquid AI, y se ajusta mediante LoRA sobre conversaciones sinteticas de role-play. Segun la model card, cada ejemplo de entrenamiento incluye un resumen corto de la escena dentro del bloque de "thinking", de modo que el modelo aprende a producir ese resumen antes de la respuesta de personaje. Tras el entrenamiento, el adaptador LoRA se fusiona con los pesos base y el resultado se cuantiza a GGUF Q4_0 usando una matriz de importancia (imatrix).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset sintetico, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovacion arquitectonica propia de LFM3 (el modelo base de Liquid AI emplea componentes de convolucion y atencion, segun la documentacion publica de LFM, pero este dato no aparece en la informacion proporcionada). El unico detalle tecnico verificable del proceso es el uso de imatrix para la cuantizacion y el hash SHA-256 del fichero publicado.

## Capacidades

- Generacion de texto conversacional orientada a roleplay e interpretacion de personajes.
- Modo de razonamiento opcional: el bloque de thinking puede activarse o desactivarse, y cuando se activa produce un resumen breve de la escena.
- Conversacion multi-turno con coherencia de personaje, segun el objetivo declarado del ajuste.
- Compatibilidad con el template de chat del modelo base LFM3-1.7B.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo sirve para validar rapidamente un flujo de roleplay con resumen de escena antes de invertir en un modelo mayor; su tamano de 1,7 B permite iterar en local.
- Pruebas de integracion en aplicaciones de chat: al ser un GGUF Q4_0 de aproximadamente 1 GB, se puede cargar en llama.cpp o en un endpoint compatible para verificar la plomeria de la aplicacion sin coste de GPU.
- Evaluacion de la estrategia de thinking con resumen de escena: util para comparar si el resumen previo mejora la coherencia del personaje frente a un ajuste sin thinking.
- Demostraciones internas de roleplay: adecuado para ensenar el comportamiento a stakeholders en un entorno controlado, nunca en atencion al cliente real.
- Estudio de tecnicas de cuantizacion: el fichero con imatrix Q4_0 sirve como referencia para medir la perdida de calidad frente a otras cuantizaciones del mismo ajuste.
- Base para experimentos de ajuste sobre LFM3: el modelo y su receta (LoRA + fusion + GGUF) son un punto de partida reproducible para otros ajustes de personaje sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con el unico fichero Q4_0 publicado, mas el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo; tambien en Raspberry Pi y mini-PC con suficiente RAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), y endpoints compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ca-rp-pilot-t1 | 1,73 B | no disponible | lfm1.0 | GGUF Q4_0 | Ajuste de roleplay, build de prueba no apto para produccion |
| LiquidAI/LFM3-1.7B | 1,7 B | no disponible | lfm1.0 | safetensors, GGUF | Modelo base sin ajuste de personaje |
| Modelos de roleplay de 1-3 B | variable | variable | variable | GGUF | No disponible comparativa concreta en la informacion proporcionada |

## Limitaciones y advertencias

- El autor declara explicitamente que es una compilacion de prueba interna y que no debe usarse en produccion.
- Riesgo elevado de alucinacion y de deriva de personaje por el tamano reducido del modelo y por el entrenamiento sobre datos sinteticos.
- No se documentan sesgos conocidos, pero un ajuste sobre chats sinteticos de roleplay puede reproducir estereotipos presentes en esos datos.
- Idiomas soportados no declarados; no hay garantia de calidad fuera del idioma de los datos de entrenamiento.
- La licencia lfm1.0 (LFM Open License v1.0) impone condiciones de uso comercial que deben revisarse en el fichero LICENSE del repositorio antes de cualquier despliegue.
- Solo se publica una cuantizacion Q4_0; no hay versiones en safetensors ni en otras precisiones para evaluar la calidad del ajuste sin perdida por cuantizacion.
- Contexto maximo no documentado; no se debe asumir la ventana del modelo base sin verificacion.
- El repositorio tiene 72 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/characteragent/ca-rp-pilot-t1-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: disponible en el fichero LICENSE del repositorio del modelo base
