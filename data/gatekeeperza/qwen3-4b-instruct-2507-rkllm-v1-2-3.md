# GatekeeperZA/Qwen3-4B-Instruct-2507-RKLLM-v1.2.3

## Resumen

El modelo `GatekeeperZA/Qwen3-4B-Instruct-2507-RKLLM-v1.2.3` es una conversión del modelo Qwen3-4B-Instruct-2507 de Alibaba al formato RKLLM, diseñado para ejecutarse en la NPU del SoC Rockchip RK3588. El autor de la conversión es GatekeeperZA, que ha utilizado el RKLLM Toolkit v1.2.3 para cuantizar el modelo original en pesos y activaciones de 8 bits (w8a8) con un tamaño de grupo de 128, optimizado para el hardware de Rockchip.

El modelo base, Qwen3-4B-Instruct-2507, es la actualización de julio de 2025 del Qwen3-4B, con mejoras significativas en seguimiento de instrucciones, razonamiento lógico, comprensión de texto, matemáticas, ciencia, programación y uso de herramientas. Con 4 mil millones de parámetros, es el modelo de solo texto más grande de la línea RK3588 de GatekeeperZA y ofrece una ventana de contexto de 16 384 tokens, superior a los 8 000 de los modelos más pequeños de la misma serie.

Esta conversión está pensada para despliegues en dispositivos de borde (edge) basados en RK3588, como la Orange Pi 5 Plus, permitiendo inferencia local de un LLM de 4B sin depender de la nube. La cuantización w8a8 reduce el consumo de memoria a aproximadamente 5,5 GB en RAM, lo que hace viable su ejecución en placas con 8 GB o más. Es relevante ahora porque democratiza el acceso a modelos de razonamiento de calidad en hardware de bajo coste y bajo consumo energético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3, base Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 16 384 tokens |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en 8 bits), group size 128 |
| Idiomas soportados | Ingles, chino (multilingue, segun el modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKLLM (.rkllm) |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Instruct-2507 es un transformer causal de 4 mil millones de parametros desarrollado por el equipo Qwen de Alibaba. La variante 2507 es una actualizacion del Qwen3-4B original, entrenada especificamente en modo no-thinking (sin razonamiento explicito) y optimizada para seguimiento de instrucciones, razonamiento logico, comprension de textos, matematicas, ciencia, programacion y uso de herramientas. El modelo base fue entrenado con un enfoque de instruccion supervisada y refinamiento por preferencias (RLHF/DPO), aunque los detalles exactos del dataset no estan disponibles en la informacion proporcionada.

La conversion RKLLM realizada por GatekeeperZA no altera la arquitectura del modelo, sino que lo cuantiza a w8a8 (pesos y activaciones en 8 bits) con un tamaño de grupo de 128, utilizando el RKLLM Toolkit v1.2.3. Esta cuantizacion esta optimizada para la NPU del RK3588, que cuenta con 3 nucleos de aceleracion. El proceso incluye un nivel de optimizacion 1 y un ratio hibrido de 0.0, lo que significa que toda la computacion se ejecuta en la NPU sin delegar partes a la CPU. Una limitacion importante es que el modo thinking (bloques de razonamiento ` thinking`) esta deshabilitado en esta build, por lo que el modelo no genera cadenas de razonamiento explicitas.

## Capacidades

- Generacion de texto en ingles y chino, con soporte multilingue adicional segun el modelo base.
- Seguimiento de instrucciones y razonamiento logico mejorado respecto a la version original de Qwen3-4B.
- Capacidades de programacion y matematicas heredadas del modelo base.
- Uso de herramientas (tool calling) soportado por el modelo base, aunque no se confirma explicitamente en esta conversion RKLLM.
- Ventana de contexto de 16 384 tokens, adecuada para resumen de documentos largos y conversaciones multi-turno.
- Inferencia local en NPU sin necesidad de conexion a internet.
- Modo thinking deshabilitado: no genera bloques de razonamiento ` thinking`.

## Casos de uso

- Asistentes de voz locales en dispositivos embebidos: el modelo puede ejecutarse en una placa RK3588 con microfono y altavoz, ofreciendo respuestas generativas sin latencia de red, gracias a la inferencia en NPU y al bajo consumo de RAM (~5,5 GB).
- Resumen de documentos extensos: con 16 384 tokens de contexto, permite procesar informes, articulos o actas de hasta varias paginas en una sola pasada, util en entornos offline como consultas medicas o legales.
- Chatbot de atencion al cliente en kioscos interactivos: el modelo gestiona conversaciones multi-turno con historial completo dentro de la ventana de contexto, respondiendo en ingles o chino sin depender de servidores externos.
- Generacion de codigo en entornos aislados: programadores que trabajan en redes aisladas o con datos sensibles pueden usar el modelo para completar o explicar fragmentos de codigo directamente en su estacion de trabajo basada en RK3588.
- Educacion y formacion offline: el modelo puede servir como tutor de matematicas o logica en dispositivos educativos de bajo coste, aprovechando sus capacidades de razonamiento y su licencia Apache-2.0 para integracion comercial.
- Prototipado rapido de aplicaciones de IA en edge: desarrolladores pueden usar el RKLLM API Server para exponer el modelo como un endpoint REST local y construir aplicaciones de procesamiento de lenguaje natural sin necesidad de GPU dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion RKLLM en la informacion disponible. El modelo base Qwen3-4B-Instruct-2507 tiene resultados publicados en el repositorio oficial de Qwen, pero no se han replicado para la version cuantizada w8a8 en RK3588. Se recomienda consultar el repositorio del modelo base para obtener cifras de referencia del modelo original sin cuantizar.

## Requisitos de hardware

- SoC compatible: RK3588 o RK3588S. No compatible con RK3576 sin reconversion.
- RAM: aproximadamente 5,5 GB cargados en memoria. Se requiere placa con 8 GB o mas; 16 GB recomendado.
- NPU: 3 nucleos del RK3588, con driver RKNPU version 0.9.6 o superior (probado con 0.9.8).
- Runtime: RKLLM Runtime version 1.2.1 o superior (recomendada v1.2.3).
- Placas probadas: Orange Pi 5 Plus con 16 GB RAM y Armbian Linux.
- Opciones de despliegue: RKLLM API Server (servidor REST local) o el demo oficial `rkllm_api_demo` del repositorio rknn-llm.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma | Licencia |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-RKLLM (este) | 4B | 16 384 | w8a8 | RK3588 NPU | Apache-2.0 |
| Qwen3-4B-Instruct-2507 (original) | 4B | 32 768 (segun el modelo base) | FP16/BF16 | GPU/CPU | Apache-2.0 |
| Qwen3-4B (version anterior) | 4B | 32 768 | FP16/BF16 | GPU/CPU | Apache-2.0 |

Nota: el contexto del modelo original Qwen3-4B-Instruct-2507 es de 32 768 tokens, pero esta conversion RKLLM lo limita a 16 384 tokens, probablemente por restricciones de memoria de la NPU. No se dispone de datos de otras conversiones RKLLM comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modo thinking esta deshabilitado en esta build RKLLM, por lo que el modelo no genera bloques de razonamiento explicito ` thinking`, lo que puede afectar a tareas que requieren cadenas de razonamiento complejas.
- La ventana de contexto se reduce de 32 768 tokens (modelo original) a 16 384 tokens en esta conversion, lo que limita el procesamiento de documentos muy extensos.
- La cuantizacion w8a8 puede introducir una degradacion ligera en la precision del modelo, especialmente en tareas numericas o de razonamiento logico, en comparacion con el modelo en FP16.
- El modelo esta optimizado principalmente para ingles y chino; el rendimiento en otros idiomas puede ser inferior al del modelo base.
- Requiere hardware especifico de Rockchip (RK3588/RK3588S) y no es portable a otras arquitecturas sin reconversion.
- No es compatible con RK3576 sin un proceso de reconversion completo.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; se recomienda validacion humana en aplicaciones criticas.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribucion y las restricciones del modelo base.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/GatekeeperZA/Qwen3-4B-Instruct-2507-RKLLM-v1.2.3
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio RKLLM API Server: https://github.com/GatekeeperZA/RKLLM-API-Server
- Repositorio oficial RKLLM (airockchip): https://github.com/airockchip/rknn-llm
