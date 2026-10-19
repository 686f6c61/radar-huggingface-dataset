# Blockway/Agens-Volundr-tiny-random

## Resumen

Agens-Volundr-tiny-random es un checkpoint de pruebas publicado por Blockway dentro de su familia Agens Volundr. No es un modelo entrenado: sus 32.827.757 parámetros son la inicialización aleatoria (semilla 0) de la implementación de referencia. Reproduce el esquema de configuración, el tokenizador, la plantilla de chat y la configuración de generación de `Blockway/Agens-Volundr-32B-v1`, pero con una arquitectura reducida de 4 capas, tamaño oculto 64 y ventana BCSA de 64.

Su propósito es servir como elemento de prueba en integración continua, concretamente en las pruebas de SGLang de la arquitectura Volundr. La model card lo indica de forma explícita: produce texto sin significado. Resulta relevante para desarrolladores que integran o mantienen la familia Volundr porque permite ejercitar rutas de código, tokenizador y servidores compatibles sin cargar un modelo de 32B.

La licencia es Apache-2.0 y el repositorio ocupa 0,1 GB. No debe confundirse con un modelo utilizable para generación real: es un fixture de ingeniería.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 4 capas: 2 KDA, 1 BCSA y 1 atención densa; Engram en la capa 1; mHC de cuatro flujos |
| Parámetros totales | 32.827.757 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; la ventana BCSA es de 64 tokens |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Librería | Transformers |
| Pipeline | Text-generation (`volundr_text`) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Agens Volundr en miniatura: 4 capas con dos capas KDA, una capa BCSA y una capa de atención densa, además de un módulo Engram en la capa 1 y un esquema mHC de cuatro flujos. El tamaño oculto es 64 y la ventana BCSA es de 64 tokens, de modo que las prompts cortas alcanzan el campo lejano. Mantiene el mismo esquema de configuración, tokenizador, plantilla de chat y configuración de generación que `Blockway/Agens-Volundr-32B-v1`.

No ha habido entrenamiento, ajuste supervisado, RLHF ni DPO: los pesos son la inicialización aleatoria de la implementación de referencia con semilla 0. La implementación de referencia en Transformers no se incluye en este repositorio; se distribuye junto con `Blockway/Agens-Volundr-32B-v1`. El checkpoint se utiliza en las pruebas de SGLang de Volundr.

## Capacidades

- Generación de texto: técnicamente emite tokens, pero los pesos aleatorios no producen texto con sentido; la propia model card lo advierte.
- Razonamiento, código y matemáticas: no evaluable; no existe entrenamiento que sustente estas capacidades.
- Tool calling o function calling: no disponible; no hay pesos entrenados que permitan verificarlo.
- Agentes y razonamiento multi-paso: no soportado por el estado aleatorio de los pesos.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Compatibilidad de infraestructura: incluye la etiqueta `endpoints_compatible` y el pipeline `volundr_text`, pensados para pruebas de servidores y endpoints.
- Inspección de arquitectura: permite observar el dispatch de capas KDA, BCSA, atención densa, Engram y mHC en un modelo pequeño.
- Validación de artefactos: sirve para comprobar tokenizador, plantilla de chat y configuración de generación heredados del 32B.

## Casos de uso

- Pruebas de integración continua en SGLang: cargar el checkpoint en la suite de tests de Volundr para validar el dispatch de las capas KDA, BCSA, atención densa, Engram y mHC sin el coste de ejecutar un modelo de 32B.
- Validación del tokenizador y de la plantilla de chat: ejecutar prompts de prueba con el tokenizador y la plantilla heredados del 32B para detectar regresiones en el formato de entrada y en la construcción de conversaciones.
- Pruebas de humo de servidores compatibles con endpoints: levantar un endpoint y comprobar que la generación devuelve tokens, `finish_reason` y métricas de uso correctas, sin evaluar la calidad del texto.
- Verificación de la configuración de generación: probar parámetros de muestreo, `max_new_tokens`, secuencias de parada y plantillas de herramientas antes de aplicarlos al modelo grande.
- Pruebas de regresión de la implementación de referencia: comparar formas tensoriales, configuración de capas y comportamiento de inicialización con el código que acompaña a `Blockway/Agens-Volundr-32B-v1`.
- Pruebas de carga de infraestructura: emplear el checkpoint como carga sintética para medir latencia de arranque, throughput de peticiones y gestión de memoria del stack de serving.
- Inspección y docencia de arquitecturas híbridas: analizar en un modelo de 4 capas el flujo de una arquitectura con KDA, BCSA, atención densa y Engram.
- Validación de scripts de conversión o empaquetado: ejecutar herramientas de formato y empaquetado sobre un checkpoint pequeño antes de aplicarlas a los modelos de 32B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Además, al tratarse de pesos aleatorios, cualquier métrica de calidad —MMLU, HumanEval, GSM8K u otras— carecería de significado y no representaría el rendimiento de la familia Agens Volundr.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 131 MB en FP32, 66 MB en FP16/BF16, 33 MB en INT8 y 16 MB en INT4, calculados a partir de 32.827.757 parámetros y sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. Una RTX 4090, una A100 o una H100 están enormemente sobredimensionadas para este checkpoint.
- CPU: suficiente para ejecutar el modelo; está pensado para entornos de CI y pruebas ligeras.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en dispositivos de baja capacidad.
- Opciones de despliegue: Transformers y SGLang, que es el objetivo declarado de las pruebas. No se confirma soporte en vLLM, TGI, llama.cpp u Ollama, y no se ofrece formato GGUF.
- Latencia y throughput: no disponible; no se publican mediciones oficiales.

## Comparativa con modelos similares

No se han identificado en la información disponible alternativas de tipo tiny-random directamente comparables. La comparación más útil es con los miembros entrenados de la misma familia:

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Agens-Volundr-tiny-random | 32.827.757 | No disponible; ventana BCSA de 64 | Pesos aleatorios, sin entrenamiento | Apache-2.0 | Pruebas de CI e inspección |
| Agens-Volundr-32B-Preview | 32B nominal | 262K | Modelo entrenado, versión Preview | Apache-2.0 | Agentes, código y razonamiento |
| Agens-Volundr-32B-v1 | 32B nominal | No disponible en la información | Modelo entrenado, release completo | Apache-2.0 | Producción |
| Agens-Volundr-32B-v1-INT4 | 32B nominal | No disponible en la información | Modelo entrenado y cuantizado a INT4 | Apache-2.0 | Producción con menor huella de VRAM |

El modelo de 32B Preview declara 72 capas, de las cuales solo 18 mantienen caché KV, y una ventana de 262K tokens. El tiny-random no hereda esas cifras de contexto: solo comparte el esquema de configuración y el tokenizador.

## Limitaciones y advertencias

- Pesos aleatorios: la salida no tiene significado y no debe usarse para evaluar calidad, razonamiento ni código.
- No es apto para producción: su función es exclusivamente testing e integración continua.
- No representa al modelo de 32B: 4 capas frente a 72, tamaño oculto 64 y una ventana BCSA de 64 no reproducen el comportamiento a escala.
- La implementación de referencia en Transformers no está incluida en este repositorio; depende del código distribuido con `Blockway/Agens-Volundr-32B-v1`.
- Longitud máxima de contexto no documentada; no debe asumirse el contexto de 262K de la familia.
- Idiomas no declarados; no hay información sobre cobertura lingüística.
- Arquitectura personalizada: el soporte se limita a las herramientas indicadas, principalmente Transformers y SGLang; no hay GGUF ni variantes cuantizadas publicadas.
- La licencia Apache-2.0 permite uso comercial, pero el checkpoint carece de utilidad funcional fuera de pruebas.
- Al no haber entrenamiento, no se han medido sesgos; aun así, los pesos aleatorios pueden emitir secuencias arbitrarias, potencialmente ofensivas, sin filtro aprendido.
- Riesgo de confusión: la etiqueta `text-generation` y el pipeline `volundr_text` pueden llevar a interpretar erróneamente que se trata de un modelo generativo utilizable.

## Enlaces

- [Hugging Face: Blockway/Agens-Volundr-tiny-random](https://huggingface.co/Blockway/Agens-Volundr-tiny-random)
- [Página de Agens Volundr en Blockway](https://www.blockway.io/volundr)
- [Repositorio GitHub de Agens-Volundr](https://github.com/BlockWayz/Agens-Volundr)
- [Hugging Face: Blockway/Agens-Volundr-32B-v1](https://huggingface.co/Blockway/Agens-Volundr-32B-v1)
- [Hugging Face: Blockway/Agens-Volundr-32B-v1-INT4](https://huggingface.co/Blockway/Agens-Volundr-32B-v1-INT4)
- [Hugging Face: Blockway/Agens-Volundr-32B-Preview](https://huggingface.co/Blockway/Agens-Volundr-32B-Preview)
- [Árbol de archivos de Agens-Volundr-32B-Preview](https://huggingface.co/Blockway/Agens-Volundr-32B-Preview/tree/main)
