# Glib165/Linum

## Resumen

Linum es un paquete de distribución local de herramientas de generación de imágenes por IA, no un modelo de lenguaje propiamente dicho. Lo desarrolla el autor independiente Glib165 y se publica en Hugging Face como un repositorio de 77,4 GB que contiene un archivo comprimido (`Linum-1.8-full.zip`, 36 GB) con un estudio de imagen completo listo para ejecutarse en Windows 10/11 sobre GPUs NVIDIA con 6 GB o más de VRAM. El paquete incluye Python, Ollama, el asistente conversacional Gaia 3.7 basado en Gemma 4 y un conjunto de modelos de arte, todo empaquetado para funcionar sin instalación ni conexión a internet tras la descarga.

El problema que resuelve es la fricción de montar un entorno local de generación de imágenes: en lugar de instalar dependencias, descargar pesos y configurar interfaces, el usuario descomprime el archivo y ejecuta un acceso directo. Es relevante para quienes quieren un estudio de imagen privado y offline sin depender de servicios en la nube, aunque su naturaleza de distribución empaquetada (no de modelo entrenado por el autor) limita la comparación técnica con modelos individuales.

La información pública disponible no detalla arquitectura, parámetros ni contexto de los componentes internos; el propio autor remite a las licencias de terceros (Apache 2.0, CreativeML OpenRAIL-M, OpenRAIL++, MIT, CC BY 4.0, BSD 3-Clause) para los modelos incluidos. El código propio de Linum se publica bajo licencia MIT, mientras que el conjunto se declara como licencia mixta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (paquete de distribución; incluye modelos de difusión y un asistente basado en Gemma 4) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | mixta (código propio MIT; modelos de terceros con Apache 2.0, CreativeML OpenRAIL-M, OpenRAIL++, MIT, CC BY 4.0, BSD 3-Clause) |
| Formato de pesos | no disponible (distribución como archivo ZIP de 36 GB; modelos internos en sus formatos originales) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura ni entrenamiento propios, ya que Linum no es un modelo entrenado por su autor sino una distribución empaquetada. El paquete integra el runtime Python, Ollama como motor de inferencia local, el asistente conversacional Gaia 3.7 (basado en Gemma 4) y varios modelos de arte para generación de imágenes. Los pesos de los modelos incluidos se distribuyen sin modificar y bajo sus licencias originales.

No se han publicado datos sobre número de tokens de entrenamiento, composición del dataset ni técnicas de ajuste (RLHF/DPO) de los componentes internos en la información disponible. La innovación principal del proyecto es de ingeniería de distribución: un entorno autocontenido que funciona sin instalación y sin conexión tras la descarga, orientado a Windows 10/11 con GPU NVIDIA de 6 GB o más.

## Capacidades

- Generación de imágenes por IA mediante los modelos de arte incluidos en el paquete.
- Asistente conversacional Gaia 3.7 (basado en Gemma 4) integrado en el estudio.
- Funcionamiento totalmente local y offline tras la descarga inicial.
- Ejecución sin instalación: Python, Ollama y modelos ya incluidos en el archivo.
- Interfaz de estudio de imagen con asistente de chat integrado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Estudio de imagen privado en local: el usuario descomprime el paquete y genera imágenes sin enviar datos a servicios en la nube, adecuado para contenido sensible o trabajo sin conexión.
- Creación de arte conceptual offline: artistas y diseñadores pueden iterar con los modelos de arte incluidos en equipos con GPU NVIDIA de 6 GB o más, sin depender de cuotas de API.
- Asistencia conversacional durante el flujo de trabajo creativo: Gaia 3.7 permite consultar ideas, describir escenas o refinar prompts dentro de la misma aplicación.
- Despliegue en entornos con conectividad restringida: al no requerir internet tras la descarga, encaja en talleres, aulas o equipos aislados.
- Prototipado rápido de pipelines de generación de imágenes: al incluir Python y Ollama, sirve como base para experimentar con los modelos de arte empaquetados.
- Evaluación de modelos de difusión locales: investigadores pueden probar los modelos incluidos bajo sus licencias originales sin montar un entorno manualmente.
- Uso educativo: la instalación por doble clic reduce la barrera técnica para introducir generación de imágenes en cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desagregada; el requisito declarado es una GPU NVIDIA con 6 GB o más.
- GPU recomendadas: no disponible; el autor solo especifica NVIDIA con 6 GB o más de VRAM.
- Cabe en GPU de consumo: sí, según el requisito mínimo de 6 GB de VRAM (modelos concretos no especificados).
- Sistema operativo: Windows 10/11.
- Opciones de despliegue: paquete autocontenido con Ollama incluido; no se documentan vLLM, llama.cpp, TGI ni otros motores alternativos.
- Latencia y throughput: no disponible.
- Espacio en disco: archivo de descarga de 36 GB; repositorio de 77,4 GB.

## Comparativa con modelos similares

| Proyecto | Tipo | Requisito de hardware | Licencia | Distribución |
|---|---|---|---|---|
| Linum | Paquete local de estudio de imagen con asistente | GPU NVIDIA con 6 GB o más, Windows 10/11 | Mixta (código MIT; modelos de terceros) | ZIP autocontenido de 36 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre proyectos directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: las capacidades reales dependen de los modelos de terceros incluidos, cuyas especificaciones no se detallan.
- Plataforma limitada: solo Windows 10/11 y GPU NVIDIA; no se menciona soporte para Linux, macOS ni GPUs AMD o Intel.
- Licencia mixta: el uso comercial debe verificar cada modelo incluido contra su licencia original (Apache 2.0, CreativeML OpenRAIL-M, OpenRAIL++, MIT, CC BY 4.0, BSD 3-Clause), con posibles restricciones de uso en algunos de ellos.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- Sin datos publicados de benchmarks, sesgos, tasas de alucinación ni rendimiento medido.
- El asistente Gaia 3.7 se describe como basado en Gemma 4, pero no se aportan detalles de cuantización ni de contexto disponible.
- Tamaño de descarga elevado (36 GB comprimido) y repo de 77,4 GB, con requisitos de almacenamiento considerables.

## Enlaces

- Hugging Face: https://huggingface.co/Glib165/Linum
- Descarga directa: https://huggingface.co/Glib165/Linum/resolve/main/Linum-1.8-full.zip?download=true
- Sitio web: https://glib165.github.io/Linum/
- Código (MIT): https://github.com/Glib165/Linum
- Lista de licencias de modelos: https://github.com/Glib165/Linum/blob/main/scripts/MODEL_LICENSES.txt
