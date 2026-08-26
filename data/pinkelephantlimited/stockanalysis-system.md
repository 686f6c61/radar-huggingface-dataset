# pinkelephantlimited/stockanalysis-system

## Resumen

StockAnalysis System es un sistema de análisis bursátil desarrollado por Pink Elephant Limited que combina dos modelos de lenguaje de código abierto, Mistral-7B-v0.3 y Llama-2-7B-Chat (NousResearch), ambos cargados en 8 bits, dentro de un notebook Marimo. El sistema se conecta a la API abierta de Tiger (Tiger OpenAPI) para obtener cotizaciones de acciones estadounidenses y genera una tabla con señales de compra (BUY), venta (SELL) o mantener (HOLD) en modo papel (PAPER_MODE=True), lo que significa que no ejecuta órdenes reales.

No se trata de un modelo de lenguaje entrenado desde cero, sino de un sistema integrador que orquesta dos LLMs existentes con una fuente de datos de mercado. Su relevancia radica en que ofrece una aproximación práctica al análisis de señales de trading con LLMs, aunque está limitado a cotizaciones de Estados Unidos y requiere hardware de alta gama (96 GB de VRAM). El proyecto se publica bajo licencia MIT y se encuentra en una fase inicial, con cero descargas y cero likes en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema Marimo Notebook que combina Mistral-7B-v0.3 y Llama-2-7B-Chat (NousResearch) en 8 bits |
| Parametros totales | 14 000 millones (7B + 7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no aplicable; utiliza pesos de los modelos base en formato HuggingFace (safetensors) |

## Arquitectura y entrenamiento

El sistema no es un modelo LLM independiente, sino un notebook de Marimo que orquesta dos modelos base de terceros: Mistral-7B-v0.3 y Llama-2-7B-Chat (versión no gated de NousResearch). Ambos se cargan en 8 bits mediante bitsandbytes para reducir el consumo de memoria. El flujo de trabajo consiste en obtener cotizaciones de acciones estadounidenses a través de la API de TigerOpen, alimentar esos datos a los modelos y generar una tabla de señales de compra, venta o mantener. No hay entrenamiento adicional ni ajuste fino; los modelos se usan tal cual en modo inferencia.

El notebook incluye correcciones de errores documentadas, como el cambio del modelo Llama-2 gated de Meta a la versión no gated de NousResearch, y la separación de celdas de interfaz en Marimo para permitir el acceso a valores de UIElement. El modo PAPER_MODE=True garantiza que no se realicen órdenes automáticas, lo que lo hace adecuado para pruebas y simulaciones.

## Capacidades

- Generacion de señales de trading (BUY/SELL/HOLD) para acciones estadounidenses basadas en datos de mercado en tiempo real de TigerOpen.
- Integración con la API de TigerOpen para consultar cotizaciones de acciones de Estados Unidos.
- Ejecución en modo paper (PAPER_MODE=True), lo que permite simular estrategias sin riesgo de capital.
- Interfaz de usuario interactiva mediante Marimo Notebook, con controles de UI separados en celdas dedicadas.
- Compatibilidad con entornos de alta VRAM (96 GB) mediante cuantización de 8 bits de dos modelos de 7B.
- No soporta tool calling, agentes, visión ni audio; su función está restringida al análisis de datos de mercado.

## Casos de uso

- **Simulacion de estrategias de trading**: el modo paper permite probar señales BUY/SELL/HOLD sin riesgo financiero real, ideal para validar hipótesis de mercado antes de operar con capital.
- **Investigacion academica en finanzas computacionales**: puede usarse como base para estudiar cómo los LLMs interpretan datos de cotizaciones y generan señales de trading, comparando el comportamiento de Mistral y Llama en el mismo pipeline.
- **Prototipado de sistemas de análisis de mercado**: el notebook sirve como plantilla para desarrollar sistemas de análisis de acciones que integren LLMs con APIs de datos financieros.
- **Formacion en análisis bursatil**: el sistema puede utilizarse en cursos de finanzas cuantitativas para ilustrar la aplicación de LLMs en el análisis de acciones, sin necesidad de conexión a mercados reales.
- **Desarrollo de estrategias de trading algorítmico**: aunque no ejecuta órdenes, las señales generadas pueden utilizarse como entrada para otros sistemas de ejecución automática.
- **Evaluacion de la calidad de cotizaciones de US**: el sistema permite explorar cómo los LLMs interpretan datos de mercado de distintas empresas estadounidenses y si generan señales coherentes con el análisis técnico básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K. Tampoco se documentan resultados de precisión de las señales de trading generadas.

## Requisitos de hardware

- **VRAM estimada**: el README indica que el sistema requiere 96 GB de VRAM para ejecutar ambos modelos en 8 bits.
- **GPUs recomendadas**: se necesitan GPUs de alta gama como NVIDIA A100 (80 GB) o H100 (80 GB) en configuraciones de múltiples GPUs para alcanzar 96 GB, o GPUs como RTX 8000/A6000 en modo multi-GPU.
- **Compatibilidad con GPU de consumo**: no es viable en GPUs de consumo (RTX 4090 con 24 GB, etc.) debido al requisito de 96 GB.
- **Opciones de despliegue**: el sistema se ejecuta mediante Marimo Notebook con el comando `marimo edit notebooks/signal_notebook.py --no-token --sandbox`. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no disponibles; dependen del hardware y de la latencia de la API de TigerOpen.

## Comparativa con modelos similares

No se ha encontrado información sobre sistemas comparables en la misma categoría (análisis de acciones con LLMs). El proyecto no publica métricas de rendimiento ni comparaciones con otras herramientas de análisis de acciones, por lo que la comparativa no está disponible.

## Limitaciones y advertencias

- **Solo cotizaciones de Estados Unidos**: la API de TigerOpen se limita a cotizaciones de US, lo que restringe el análisis a ese mercado.
- **Sin ejecución de órdenes reales**: el modo PAPER_MODE impide operar en mercados reales, por lo que no es adecuado para trading en producción.
- **Dependencia de servicios externos**: el sistema requiere credenciales de TigerOpen (TIGER_ID, TIGER_PRIVATE_KEY_PK8, TIGER_ACCOUNT) y la instalación de paquetes como `tigeropen`, `bitsandbytes` y `accelerate`.
- **Alto requisito de hardware**: 96 GB de VRAM limitan su uso a entornos con GPUs de servidor o clústeres, excluyendo estaciones de trabajo estándar.
- **Riesgo de alucinación**: al usar LLMs de propósito general sin ajuste específico para finanzas, las señales BUY/SELL/HOLD pueden ser inconsistentes o alucinadas; no se han validado contra datos históricos.
- **Código en fase temprana**: el proyecto tiene 0 descargas y 0 likes en Hugging Face, y la documentación menciona errores corregidos, lo que indica que es una versión preliminar.
- **Licencia MIT**: aunque la licencia permite uso comercial, los modelos subyacentes (Mistral-7B-v0.3 y Llama-2-7B-Chat) tienen sus propias licencias (Apache 2.0 y Llama 2 Community License respectivamente), que deben cumplirse por separado.

## Enlaces

- [Hugging Face: pinkelephantlimited/stockanalysis-system](https://huggingface.co/pinkelephantlimited/stockanalysis-system)
- [Perfil de Pink Elephant Limited en Hugging Face](https://huggingface.co/pinkelephantlimited)
- [GitHub de Pink Elephant Limited](https://github.com/pinkelephantlimited/)
- [Repositorio pink-elephant-llm en GitHub](https://github.com/pinkelephantlimited/pink-elephant-llm)
