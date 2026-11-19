# Bhoidy/nyx-image-23m

## Resumen

Nyx Image (`NyxImage23M`) es un modelo de difusión discreta enmascarada (MDLM) de 23,19 millones de parámetros desarrollado por Bhoidy (Sednium Technologies) para la generación de sprites de pixel art retro de 16×16 píxeles a partir de prompts de texto. A diferencia de los modelos de difusión latente convencionales, no utiliza autoencoders ni VAE: opera directamente sobre tokens discretos de paleta (`vocab_size = 513`), con el índice 0 reservado para transparencia alfa nativa. Esto garantiza bordes de píxel duros y sombreado retro auténtico desde el primer paso de muestreo.

El modelo emplea una arquitectura transformer con backbone de reloj de arena asimétrico: dos bloques de alta resolución a 16×16, una fusión de parches 2×2 que reduce a 8×8, seis bloques de cuello de botella con Conv-SwiGLU, y una separación simétrica de vuelta a 16×16 con dos bloques decodificadores. Se condiciona con embeddings congelados de CLIP ViT-B/32 (24 tokens × 512 dimensiones) y representaciones de color Fourier OKLab de seis frecuencias. Genera en 16 pasos paralelos y se distribuye en formatos Safetensors y ONNX (Opset 17), con un tamaño de repositorio de 0,2 GB.

Su relevancia actual radica en tres factores: es un modelo extremadamente compacto (~46 MB en fp16) apto para despliegue en edge y motores de juego nativos (Rust con `ort`/`tract`, móviles), incorpora un mecanismo de simetrización bilateral en tiempo de inferencia (`symmetry_strength=0.5`) que corrige extremidades asimétricas sin reentrenamiento, y se publica bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones en juegos indie y jams.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión discreta enmascarada (MDLM) con backbone de reloj de arena asimétrico y fusión/separación de parches 2×2 |
| Parametros totales | 23.191.824 (23,19 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionamiento de texto limitado a 24 tokens de CLIP ViT-B/32) |
| Tipos de cuantizacion | No disponible (se distribuye en fp16 y ONNX; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | No disponible (el condicionamiento es vía CLIP ViT-B/32, multilingüe de forma indirecta, pero no se declara soporte explícito) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`.safetensors`) y ONNX (`.onnx`, Opset 17) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión discreta enmascarada con un backbone de reloj de arena asimétrico. La resolución nativa es de 16×16 píxeles, procesada en dos bloques de alta resolución, seguida de una fusión de parches 2×2 que reduce la rejilla a 8×8, seis bloques de cuello de botella con convoluciones SwiGLU, y una separación de parches 2×2 que devuelve la resolución a 16×16 con dos bloques decodificadores. El vocabulario de salida es de 513 tokens discretos de paleta, con el índice 0 como transparencia alfa. El condicionamiento de texto proviene de CLIP ViT-B/32 congelado, con 24 tokens de 512 dimensiones más proyecciones pooled, y se refuerza con representaciones de color Fourier OKLab de seis frecuencias que anclan los identificadores de paleta al espacio perceptual.

El entrenamiento se realizó sobre el dataset `Angais/pixel-art-atlas-1.4m`, con una pérdida final declarada de 1,5569 nats y una perplejidad de 4,74. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacable es la simetrización bilateral en tiempo de inferencia mediante mezcla de logits espejados (`symmetry_strength=0.5`), que fuerza simetría limpia en sprites sin necesidad de reentrenar el modelo, junto con la generación en 16 pasos paralelos que evita la decodificación secuencial O(N) de los modelos autorregresivos de píxeles.

## Capacidades

- Generación de texto a imagen especializada en sprites de pixel art de 16×16 píxeles con paleta discreta.
- Salida con transparencia alfa nativa (índice 0), sin necesidad de chroma key ni postprocesado.
- Generación en 16 pasos paralelos de difusión enmascarada, con latencia muy reducida.
- Condicionamiento de texto mediante CLIP ViT-B/32 congelado, con soporte para prompts descriptivos de objetos, personajes y estilos retro.
- Simetrización bilateral en inferencia para sprites de personajes y criaturas.
- Anclaje de color perceptual mediante Fourier OKLab de seis frecuencias.
- Exportación a ONNX (Opset 17) para ejecución en motores nativos y dispositivos embebidos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.

## Casos de uso

- Generación de assets para juegos indie: el modelo produce sprites de 16×16 con alfa nativo listos para importar en motores 2D, eliminando el recorte manual y la reducción de color que exigen los modelos de difusión latente.
- Game jams y prototipado rápido: con 23,19 M de parámetros y 16 pasos de muestreo, se pueden generar lotes de sprites en segundos en hardware modesto, lo que encaja en plazos de 48-72 horas.
- Despliegue en edge y dispositivos móviles: la exportación ONNX Opset 17 permite ejecutar el modelo en Rust (`ort`/`tract`) y en móviles con latencia declarada sub-milisegundo, sin depender de GPU de servidor.
- Generación procedural de variantes de personajes: la simetrización bilateral en inferencia permite crear criaturas y avatares simétricos de forma consistente para sistemas de personalización.
- Herramientas de autoría integradas en editores: el tamaño reducido (~46 MB en fp16) permite empaquetar el modelo dentro de un editor de sprites de escritorio y ofrecer sugerencias de sprite en local, sin conexión.
- Creación de paletas y sets temáticos: el anclaje OKLab permite generar conjuntos coherentes de sprites con una paleta perceptual consistente para un mismo proyecto.
- Educación y demostraciones de difusión discreta: al ser un MDLM compacto con pesos abiertos y licencia permisiva, sirve para enseñar y experimentar con difusión discreta sin grandes recursos de cómputo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Final Loss | 1,5569 nats | Angais/pixel-art-atlas-1.4m |
| Perplexity | 4,74 | Angais/pixel-art-atlas-1.4m |
| Parameters | 23.191.824 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (~46 MB de pesos más activaciones y el codificador CLIP ViT-B/32 congelado); en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, iGPU y GPUs de gama baja. Para lotes grandes se recomienda cualquier GPU con al menos 2 GB de VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3050, RTX 4060, GTX 1650, e integradas recientes) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (Opset 17), `ort` y `tract` para Rust, y ejecución nativa con Safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el autor declara ejecución sub-milisegundo en edge con ONNX; no se proporcionan cifras de throughput por lote ni latencia en GPU de escritorio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Salida | Alfa nativo | Pasos | Licencia |
|---|---|---|---|---|---|---|
| Nyx Image 23M | MDLM con reloj de arena asimétrico | 23,19 M | 16×16 paleta discreta | Sí (índice 0) | 16 paralelos | Apache-2.0 |
| Tessera-Small (`thejagstudio`) | MDLM plano | 47,6 M | 16×16 paleta discreta | Sí (índice 0) | 16-32 paralelos | CC BY-NC 4.0 (no comercial) |
| SDXL Pixel Art | Difusión latente continua (UNet+VAE) | ~2.600 M | 1024×1024 RGB continuo | No | 30-50 | OpenRAIL++ |
| SD 1.5 PixelArt SpriteSheet | Difusión latente continua (UNet+VAE) | ~860 M | 512×512 RGB continuo | No (requiere chroma key) | 25-50 | CreativeML OpenRAIL-M |
| Retro Diffusion (Astropulse) | Difusión propietaria + downsampler | Propietario | Hojas de sprites multirresolución | Variable (postproceso) | Latencia de API | Cerrada / servicio de pago |
| Pixel Transformer autorregresivo | Autorregresivo secuencial | ~10-30 M | 16×16 tokens discretos | Sí | 256 secuenciales O(N) | Variable |

Frente a Tessera-Small, Nyx Image es 2,05 veces más pequeño gracias al cuello de botella de fusión de parches 2×2 y ofrece licencia comercial Apache-2.0 en lugar de CC BY-NC 4.0. Frente a SDXL y SD 1.5, evita el postprocesado de reducción de color y el chroma key, a costa de limitarse a 16×16. Frente a Retro Diffusion, es de pesos abiertos y ejecutable en local.

## Limitaciones y advertencias

- Especialización estricta: solo genera sprites de 16×16; no produce ilustraciones de alta resolución ni lienzos mayores sin composición multi-tile.
- Los prompts con múltiples sujetos complejos pueden perder detalle fino dentro del presupuesto de 256 píxeles.
- El condicionamiento de texto está limitado a 24 tokens de CLIP ViT-B/32, lo que restringe la complejidad de las instrucciones.
- No se documentan sesgos conocidos ni evaluación de sesgos; el dataset de entrenamiento (`Angais/pixel-art-atlas-1.4m`) no está descrito en detalle en la información disponible.
- Riesgo de alucinación visual: puede generar sprites con anatomía o paletas incoherentes en prompts ambiguos, mitigado parcialmente por la simetrización bilateral.
- Los resultados de benchmarks (loss 1,5569 nats, perplejidad 4,74) están declarados por el autor y no verificados.
- Licencia Apache-2.0 permisiva para uso comercial, sin las restricciones de uso de OpenRAIL; aun así, conviene revisar las condiciones del dataset de entrenamiento antes de un despliegue comercial a gran escala.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Bhoidy/nyx-image-23m
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Bhoidy/nyx-image-23m
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Sitio del desarrollador (Sednium Technologies): https://sednium.com
