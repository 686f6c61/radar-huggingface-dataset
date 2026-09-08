# 9bow/webtorch-models

## Resumen

Este repositorio no contiene un modelo de lenguaje como tal, sino bundles de runtime WebTorch exportados y verificados por hash para el playground de WebTorch. Desarrollado por 9bow, sirve para ejecutar modelos de texto en el navegador mediante WebGPU, sin necesidad de servidor. Los bundles incluyen manifest, grafos, kernels WGSL, tokenizadores y shards de pesos, empaquetados para que el navegador los cargue de forma relativa a `manifest.json`. El repositorio pesa 12.6 GB y aloja derivados de modelos como Qwen y EXAONE, sujetos a sus licencias upstream. La relevancia actual radica en la inferencia client-side con privacidad y sin infraestructura, aunque el autor advierte que son artefactos experimentales que no certifican calidad ni producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (depende del modelo upstream; se mencionan derivados de Qwen y EXAONE) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card menciona "perfiles cuantizados opcionales" sin detallar) |
| Idiomas soportados | No disponibles |
| Licencia | other (cada bundle sujeto a su licencia upstream; los derivados de EXAONE incluyen restricciones no comerciales) |
| Formato de pesos | WebTorch bundle (manifest.json, grafos, kernels WGSL, tokenizer y shards de pesos; no son safetensors estándar) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado por 9bow, sino artefactos de runtime exportados para el SDK WebTorch. Según la documentación de WebTorch (webpytorch), se trata de un SDK compatible con PyTorch que se ejecuta dentro de Pyodide sobre WebGPU, con fallback a WebGL. Incluye un núcleo compatible con torch (Tensor, autograd, nn, optim), una API de modelos estilo transformers, un runtime ONNX genérico y un cuantizador streaming. Los bundles se generan a partir de modelos upstream, pero no se proporcionan datos de entrenamiento, tokens ni composición de dataset. La innovación destacable es la ejecución de modelos completos en el navegador, con carga de recursos relativa al manifest y verificación por hash.

## Capacidades

- Generación de texto en el navegador mediante WebGPU, sin servidor.
- Carga de modelos a través de manifest.json, con todos los recursos relativos.
- Soporte de cuantización streaming (aunque sin detalles de perfiles).
- Compatibilidad con WebGPU y fallback a WebGL.
- API estilo transformers y runtime ONNX genérico según WebTorch.
- No se documenta soporte de tool calling, agentes, visión o audio.
- Capacidades multilingües no disponibles.

## Casos de uso

- Demostraciones interactivas en el navegador: los desarrolladores pueden cargar un bundle desde una URL pública y ejecutar el modelo en una página web estática, ideal para prototipos y demos sin backend.
- Aplicaciones con privacidad: al ejecutar la inferencia en el cliente, los datos del usuario no salen del navegador, lo que resulta útil para entornos con requisitos de confidencialidad.
- Educación y experimentación: permite a estudiantes e investigadores probar modelos de lenguaje en el navegador, sin necesidad de instalar CUDA ni gestionar dependencias.
- Integración en aplicaciones web progresivas (PWA): los bundles pueden servirse desde un CDN y cargarse bajo demanda, habilitando funcionalidades de IA en aplicaciones web sin infraestructura dedicada.
- Pruebas de compatibilidad de WebGPU: el proyecto sirve para validar el rendimiento y la reproducibilidad en diferentes adaptadores WebGPU, como Chrome, Edge, Safari o Firefox.
- Prototipado de modelos cuantizados: el cuantizador streaming permite experimentar con perfiles de cuantización en el navegador, aunque la model card indica que son diagnósticos opcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (depende del modelo upstream y del perfil de cuantización).
- GPU recomendadas: cualquier GPU compatible con WebGPU. En la práctica, NVIDIA RTX 20 en adelante, AMD RDNA2, Intel Arc y Apple Silicon (M1/M2/M3) son compatibles, pero no hay una lista oficial en la información.
- Capacidad en GPU de consumo: sí, porque la ejecución es en el navegador, pero el tamaño del modelo y la memoria disponible en el dispositivo determinan el límite.
- Opciones de despliegue: navegador (Chrome, Edge, Safari, Firefox) con WebGPU; el runtime WebTorch se ejecuta en Pyodide; no requiere servidor ni instalación nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados. Existen alternativas de la misma categoría como WebLLM y Transformers.js, pero no se pueden comparar numéricamente en esta ficha.

## Limitaciones y advertencias

- El autor declara que los bundles son experimentales y no certifican calidad, seguridad, producción ni compatibilidad amplia de hardware.
- Los bundles no son checkpoints de Transformers sin modificar; un archivo `model.safetensors` no puede sustituir al bundle exportado.
- La licencia es "other" y cada bundle está sujeto a la licencia del modelo upstream. Los derivados de EXAONE incluyen restricciones no comerciales, lo que debe tenerse en cuenta para uso comercial.
- No se especifican sesgos conocidos ni riesgos de alucinación, ya que dependen del modelo subyacente.
- La carga requiere que el navegador soporte WebGPU; en adaptadores no probados, la reproducibilidad no está garantizada.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto muy reciente o de baja adopción.

## Enlaces

- HuggingFace: https://huggingface.co/9bow/webtorch-models
- Playground de WebTorch: https://9bow.github.io/webtorch/
- Repositorio del runtime WebTorch (según model card): https://github.com/9bow/webtorch
- Repositorio webpytorch (encontrado en búsqueda web): https://github.com/xnetsc/webpytorch
