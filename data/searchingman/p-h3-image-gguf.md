# SearchingMan/P-H3-Image-GGUF

## Resumen

P-H3-Image GGUF es una cuantización en formato GGUF del modelo de difusión PrunaAI/P-H3-Image, preparada por el usuario SearchingMan para su uso con stable-diffusion.cpp. El modelo subyacente es MiniMax-H3, un sistema de generación y edición de imágenes texto-a-imagen con un transformer de difusión de aproximadamente 33B parámetros, acompañado de un codificador de texto Qwen3-VL-4B y un VAE independiente. Esta versión GGUF permite ejecutar el pipeline fuera de los frameworks habituales de PyTorch, con pesos cuantizados y un diseño de tres ficheros separados por componente.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras conversiones GGUF de un modelo de la familia MiniMax-H3 para stable-diffusion.cpp, lo que habilita inferencia en hardware de consumo; por otro, expone una licencia comunitaria con restricciones geográficas severas que excluyen explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos. Cualquier evaluación de despliegue debe considerar esa limitación antes que los aspectos técnicos.

El repositorio tiene 29,3 GB y, en el momento de la consulta, cero descargas y cero likes, lo que indica que es una conversión reciente (creada el 3 de noviembre de 2026) y sin validación comunitaria acumulada. El soporte de P-H3-Image en stable-diffusion.cpp está pendiente de fusión upstream, por lo que se requiere compilar una rama específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax-H3) con codificador de texto Qwen3-VL-4B y VAE independiente |
| Parametros totales | 4.503.392.768 (según safetensors del modelo base); el transformer se describe como de 33B en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (transformer), Q8_0 (text encoder), F16 (VAE); mezcla interna de Q4_K, Q4_0, BF16 y F32 según componente |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (excluye UE, Reino Unido, Corea del Sur y EE. UU.); partes Qwen3-VL-4B bajo Apache 2.0 |
| Formato de pesos | GGUF (tres ficheros: transformer, text encoder y VAE) |

## Arquitectura y entrenamiento

El pipeline sigue un esquema de difusión texto-a-imagen con tres componentes desacoplados. El transformer de difusión, de aproximadamente 33B parámetros según la model card, procesa el latent y las condiciones de texto; el codificador de texto es Qwen3-VL-4B, un modelo multimodal de la familia Qwen3 que aporta representaciones lingüísticas y, presumiblemente, capacidad de condicionamiento visual para tareas de edición; y el VAE decodifica el latent a píxeles. Los ficheros GGUF han sido convertidos desde el checkpoint publicado por PrunaAI, con tensores renombrados y reordenados al layout original de MiniMax-H3, y posteriormente cuantizados.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Sí especifica que el muestreo utiliza la rejilla de 8 pasos sigma del checkpoint y opera sin CFG (classifier-free guidance), lo que reduce el coste computacional por imagen. El pipeline de referencia incluye un upsampler de prompts que no está incluido en esta conversión, por lo que la calidad final depende de la riqueza del prompt proporcionado por el usuario. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes texto-a-imagen a resoluciones altas, con rendimiento óptimo declarado entre 4 y 8 megapíxeles.
- Edición de imágenes: admite hasta ocho imágenes de referencia pasadas como `-r`, donde la primera es la imagen a editar y las restantes actúan como contexto.
- Edición guiada por instrucciones en lenguaje natural que preservan estilo, composición y figuras, según el ejemplo de la model card (cambio a noche nevada manteniendo la pintura original).
- Condicionamiento mediante un codificador Qwen3-VL-4B, que aporta comprensión multimodal del texto y potencialmente de las imágenes de referencia.
- Muestreo sin CFG con rejilla de 8 pasos sigma, lo que simplifica la configuración y acelera la inferencia.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode, al tratarse de un modelo generativo de imagen.

## Casos de uso

- Ilustración editorial y conceptual: generar imágenes a 2048x2048 con prompts detallados para acompañar artículos, aprovechando el rango de 4 a 8 megapíxeles y el estilo pictórico que el modelo maneja bien según los ejemplos de la model card.
- Edición de material fotográfico o pictórico existente: modificar condiciones de iluminación, climatología o atmósfera sobre una imagen de entrada preservando composición y figuras, útil en postproducción y retoque asistido.
- Prototipado rápido de conceptos visuales: iterar variaciones de una escena con el mismo prompt base y distintos detalles, con un coste de muestreo de aproximadamente 45 segundos por imagen a 2048x2048 en una RTX 5090 Laptop.
- Generación de assets para videojuegos o narrativa visual: producir fondos y escenarios coherentes con un estilo definido mediante prompts ricos en detalles, dado que el modelo rinde mejor con descripciones extensas.
- Flujos de trabajo locales y offline: al ejecutarse con stable-diffusion.cpp y pesos GGUF, permite pipelines en máquinas sin PyTorch ni CUDA propietario, integrables en scripts de línea de comandos.
- Investigación en cuantización de modelos de difusión: el repositorio sirve como referencia para estudiar el impacto de Q4_K_M en un transformer de 33B y comparar con el checkpoint original en BF16.
- Edición multi-referencia: usar varias imágenes de contexto para transferir estilo o composición entre ellas, útil en tareas de estilización controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento proporcionada es el tiempo de muestreo: aproximadamente 45 segundos para una imagen de 2048x2048 en una RTX 5090 Laptop GPU, con 8 pasos y sin CFG.

## Requisitos de hardware

- VRAM estimada: el transformer cuantizado Q4_K_M ocupa 18,8 GB, el text encoder Q8_0 5,4 GB y el VAE F16 5,2 GB; en total, alrededor de 29,4 GB de pesos, aunque no todos necesitan residir simultáneamente en VRAM según la implementación de stable-diffusion.cpp.
- GPU recomendadas: RTX 5090 (validada por el autor), y por capacidad de memoria, A100 40/80 GB, H100 y RTX 4090 24 GB (esta última al límite si se cargan todos los componentes).
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más si se gestiona la carga por etapas; en 16 GB requeriría offloading parcial a RAM del sistema.
- Opciones de despliegue: stable-diffusion.cpp compilando la rama `p-h3-image` (el soporte upstream está pendiente); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a difusión.
- Latencia: aproximadamente 45 segundos por imagen de 2048x2048 en RTX 5090 Laptop; no se proporcionan cifras de throughput para otras GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos comparables de la misma categoría, por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License Agreement excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, donde no se conceden derechos de uso, reproducción ni distribución. Esto invalida el uso comercial o personal en España sin autorización adicional.
- Soporte incompleto en stable-diffusion.cpp: la integración upstream está pendiente, por lo que se debe compilar una rama específica y la estabilidad no está garantizada.
- Sin upsampler de prompts: el pipeline de referencia lo incluye, pero esta conversión no, lo que puede degradar la calidad con prompts escuetos.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir detalles inconsistentes, anatomías incorrectas o texto ilegible en las imágenes.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o estilísticos; se desconoce la composición del dataset de entrenamiento.
- Idiomas: no se especifican los idiomas soportados por el codificador de texto ni por el condicionamiento, aunque Qwen3-VL-4B sugiere cobertura multilingüe amplia.
- Repositorio sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, sin evidencia de pruebas independientes.
- Mezcla de licencias: el codificador Qwen3-VL-4B está bajo Apache 2.0, pero el conjunto del pipeline queda sujeto a la licencia MiniMax, lo que exige revisión legal en cualquier despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SearchingMan/P-H3-Image-GGUF
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
