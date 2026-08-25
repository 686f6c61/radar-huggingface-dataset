# nicolasembleton/Apodex-1.1-mini-MLX-8bit

## Resumen

Apodex-1.1-mini-MLX-8bit es una conversión del modelo Apodex-1.1-mini al formato MLX, realizada por nicolasembleton con la librería mlx-lm 0.31.3. El modelo base, desarrollado por Apodex, es un sistema de razonamiento de código abierto diseñado para tareas de investigación complejas y exigentes, con un enfoque en la verificación paso a paso de cada resultado. Esta versión cuantizada a 8 bits permite su despliegue local en hardware de Apple Silicon, manteniendo un equilibrio entre rendimiento y uso de memoria.

El modelo se basa en la arquitectura Qwen3.5-35B-A3B, un MoE con 256 expertos totales y 8 activos por token, con 40 capas de atención híbrida lineal/completa y una ventana de contexto de 262.144 tokens. Se comercializa bajo licencia Apache 2.0 y está disponible en Hugging Face con formato MLX, aunque el repo ocupa 36,8 GB. Su relevancia actual radica en ofrecer capacidades de razonamiento avanzado con pesos abiertos, pensado para despliegue local en tareas de investigación y soluciones de alto nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-35B-A3B (MoE, transformer con atencion hibrida lineal/completa) |
| Parametros totales | 35B (36B segun README, 9.749.130.368 en safetensors cuantizado) |
| Parametros activos | 3B (MoE) |
| Longitud de contexto | 262.144 tokens (max position embeddings) |
| Tipos de cuantizacion | 8-bit affine (group size 64, bits por peso 8.685) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Apodex-1.1-mini emplea una arquitectura MoE (Mixture of Experts) derivada de Qwen3.5-35B-A3B, con 256 expertos totales y 8 expertos activos por token, lo que reduce significativamente el coste computacional en inferencia. Cuenta con 40 capas de transformer con atencion híbrida: combina mecanismos de atencion lineal y atencion completa, optimizando el procesamiento de secuencias largas. La torre de vision fue eliminada durante la conversion a MLX, por lo que esta version es exclusivamente de texto. Los datos de entrenamiento no estan disponibles en la informacion proporcionada; el modelo base se describe como un "self-evolving heavy-duty solver" que realiza investigacion profunda y verifica cada paso del razonamiento, lo que sugiere un enfoque de entrenamiento orientado a tareas de razonamiento riguroso, aunque no se detalla el proceso (RLHF, DPO, etc.).

## Capacidades

- Generacion de texto y razonamiento avanzado: disenado para tareas complejas de investigacion y solucion de problemas de alto nivel.
- Razonamiento multi-step: el modelo base Apodex esta orientado a la verificacion paso a paso de cada resultado, lo que permite tareas de razonamiento profundo.
- Soporte de contexto largo: 262.144 tokens de ventana, adecuado para documentos extensos y conversaciones de multiples turnos.
- Capacidad multilingue: no especificada en la informacion disponible.
- Tool calling y function calling: no se menciona explicitamente en la documentacion proporcionada.
- Capacidades de agente: el modelo base soporta "Agent Team mode" segun la documentacion de Apodex 1.1, aunque no se detalla la implementacion en esta version MLX.
- Solo texto: la torre de vision fue eliminada, no soporta entrada de imagenes.

## Casos de uso

- Investigacion de escritorio: el modelo puede analizar grandes volumenes de documentos, extraer conclusiones y verificar fuentes, gracias a su contexto de 262.144 tokens y su enfoque en razonamiento riguroso. Adecuado para tareas de deep research en entornos de escritorio.
- Razonamiento matematico y cientifico: con su capacidad de verificacion paso a paso, puede resolver problemas complejos de matematicas, fisica o ingenieria, donde cada paso de la solucion necesita validacion.
- Analisis de contratos y documentos legales: su contexto largo permite procesar contratos extensos y generar resumenes o detectar clausulas problematicas, con razonamiento detallado sobre cada seccion.
- Chatbots conversacionales locales: con MLX y Apple Silicon, puede desplegarse como asistente conversacional con contexto largo, ideal para aplicaciones de escritorio sin conexion.
- Generacion de codigo con razonamiento: aunque no se especifica tool calling, su capacidad de razonamiento multi-step puede aplicarse a la generacion de codigo complejo con explicaciones verificadas.
- Educacion e investigacion academica: para estudiantes e investigadores que necesitan explorar hipotesis y verificar argumentos con un modelo local de alto rendimiento, sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion de Apodex 1.1 menciona que el modelo de 35B parametros alcanza un rendimiento cercano a un modelo aproximadamente 28 veces mayor en modo "Agent Team", pero no se proporcionan cifras concretas ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 8-bit ocupa 36.8 GB en disco; en memoria, se recomienda al menos 48 GB de memoria unificada para inferencia con contexto largo (prefill sin OOM).
- GPU recomendadas: Apple Silicon con 48 GB o mas de memoria unificada (por ejemplo, M2 Ultra, M3 Max, M4 Max). Con menos de 48 GB, se recomienda mantener el contexto por debajo de 32k tokens para evitar errores de memoria (Metal OOM).
- No cabe en GPUs de consumo convencional (RTX 4090 de 24 GB) en esta cuantizacion; se necesitaria cuantizacion adicional (4-bit o 6-bit) para reducir el peso.
- Opciones de despliegue: mlx-lm (pip install mlx-lm) para generacion local en Apple Silicon; tambien se puede convertir a otros formatos (GGUF, etc.) si se desea usar en llama.cpp u otros runtime.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| Apodex-1.1-mini-MLX-8bit | 35B (3B activos) | 262k | Apache 2.0 | 8-bit MLX | Hugging Face |
| Apodex-1.0-mini-mlx-8Bit | No disponible | No disponible | Apache 2.0 | 8-bit MLX | Hugging Face |
| Qwen3.5-35B-A3B (base) | 35B (3B activos) | 262k | Apache 2.0 | Varias | Hugging Face |

La comparativa se limita a los modelos relacionados con el ecosistema Apodex y su base Qwen3.5, ya que no hay datos de modelos similares de otros fabricantes en la informacion disponible.

## Limitaciones y advertencias

- Limitacion de memoria en Metal: en hardware con menos de 48 GB de memoria unificada, la prefill de contexto largo puede causar OOM (out-of-memory). Se recomienda mantener el contexto bajo 32k tokens en estos equipos.
- Solo texto: la torre de vision fue eliminada en la conversion, no admite imagenes ni video.
- Riesgo de alucinacion: no se documenta especificamente, pero como modelo de generacion de texto, existe el riesgo inherente de generar informacion falsa, especialmente en tareas de investigacion complejas.
- Sesgos: no se han publicado estudios de sesgo para este modelo.
- Contexto recomendado: aunque el maximo es 262k tokens, en hardware limitado es necesario reducir el contexto para evitar degradacion de rendimiento.
- Restricciones de licencia: licencia Apache 2.0, permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y la atribucion.
- Uso en produccion: al ser una conversion no oficial, se recomienda validar el comportamiento en escenarios reales antes de desplegar en produccion critica.

## Enlaces

- [nicolasembleton/Apodex-1.1-mini-MLX-8bit](https://huggingface.co/nicolasembleton/Apodex-1.1-mini-MLX-8bit)
- [apodex/Apodex-1.1-mini](https://huggingface.co/apodex/Apodex-1.1-mini)
- [Coleccion de modelos Apodex-1.1](https://huggingface.co/collections/apodex/apodex-11)
- [Asur4N/Apodex-1.0-mini-mlx-8Bit](https://huggingface.co/Asur4N/Apodex-1.0-mini-mlx-8Bit)
- [Web oficial de Apodex](https://www.apodex.ai/)
- [Blog sobre Apodex 1.1 en explainx.ai](https://www.explainx.ai/blog/apodex-1-1-agent-team-frontieragent-august-2026)
