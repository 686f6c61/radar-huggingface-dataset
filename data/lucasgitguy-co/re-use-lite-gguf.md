# Lucasgitguy-co/RE-USE-Lite-GGUF

## Resumen

RE-USE Lite GGUF es una versión destilada e **no oficial** del modelo de mejora de voz universal NVIDIA NemotronLabs RE-USE, publicada por el usuario Lucasgitguy-co. El modelo original aborda de forma conjunta ruido, reverberación, clipping y pérdida de ancho de banda en señales de voz de 8 a 48 kHz; esta variante reduce el modelo profesor de 30 bloques TFMamba a solo 4, manteniendo el codificador y los decodificadores originales, con el objetivo de acelerar la inferencia.

La arquitectura combina un codificador y decodificadores del profesor con bloques TFMamba (una variante de Mamba adaptada al dominio de audio) seleccionados de forma equidistante. El estudiante tiene 2.382.659 parámetros frente a los 9.607.747 del profesor (4,0 veces más pequeño) y se entrenó por destilación en una GPU NVIDIA L4 en Modal para imitar la salida del profesor sobre VoiceBank-DEMAND con reverberación, low-pass y clipping añadidos.

El dato más relevante para el lector es que el autor declara explícitamente que **la puerta de calidad de la release falló**: el estudiante es 5,51 veces más rápido a 16 kHz pero pierde calidad frente al profesor, especialmente en el conjunto degradado (PESQ 0,783 del profesor). Se publica tal cual para inspección, y el propio autor recomienda usar el profesor cuando la calidad sea prioritaria. Esta ficha describe el modelo GGUF para audio.cpp, con pesos F32 y F16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador con 4 bloques TFMamba (destilado de un transformer-Mamba de 30 bloques) |
| Parámetros totales | 2.382.659 (profesor: 9.607.747) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, sin ventana de contexto textual) |
| Tipos de cuantización | F32 (recomendado), F16; Q8_0 descartado por deriva excesiva (25-35 dB) |
| Idiomas soportados | Inglés (datos de entrenamiento en inglés) |
| Licencia | openmdw-1.1 (license: other) |
| Formato de pesos | GGUF (audio.cpp) |

## Arquitectura y entrenamiento

El estudiante conserva el codificador y ambos decodificadores del profesor RE-USE y sustituye los 30 bloques TFMamba por 4 bloques seleccionados de forma equidistante a lo largo de la profundidad original. TFMamba es una variante de Mamba (modelo de estado espacio) adaptada al procesamiento de audio, lo que permite modelar dependencias temporales largas con coste lineal. El modelo procesa entrada de 8 a 48 kHz y preserva la tasa de muestreo, los canales y la longitud de la señal de salida.

El entrenamiento consistió en destilación sobre VoiceBank-DEMAND-16k (habla leída en inglés) con reverberación, filtrado low-pass y clipping añadidos sintéticamente, ejecutada en Modal con una NVIDIA L4. No se menciona uso de RLHF ni DPO. La innovación principal es la poda de profundidad de los bloques Mamba combinada con destilación para igualar la salida del profesor, aunque el resultado medido muestra que la poda sacrifica demasiada calidad en los escenarios degradados.

## Capacidades

- Mejora de voz universal: eliminación de ruido, dereverberación, declipping y extensión de ancho de banda en una sola pasada.
- Procesamiento de audio de 8 a 48 kHz con preservación de tasa, canales y longitud.
- Inferencia offline bidireccional (no apta para streaming en vivo).
- Salida audio-a-audio (pipeline `audio-to-audio`).
- Ejecución vía audio.cpp con backend CPU y pesos GGUF.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades textuales: es un modelo puramente de audio.

## Casos de uso

- Restauración de grabaciones históricas: el modelo puede recuperar ancho de banda y reducir ruido en material de 8 kHz, aunque la degradación de clipping y reverberación es donde pierde más calidad (PESQ 1,994 frente a 2,546 del profesor), por lo que conviene usarlo solo cuando la velocidad prime sobre la fidelidad.
- Preprocesado para ASR en pipelines de bajo coste: al ser 5,51 veces más rápido a 16 kHz y ocupar 4,0 veces menos parámetros, puede servir como etapa de limpieza previa en sistemas de reconocimiento de voz donde el margen de error del ASR absorba la pérdida de calidad.
- Limpieza de audio para vídeo o podcast: útil para reducir ruido de fondo en grabaciones de habla inglesa, con la advertencia de que voces solapadas pueden suprimirse.
- Prototipado y experimentación en investigación: al ser un estudiante destilado con 4 bloques, permite estudiar el efecto de la poda de profundidad en modelos Mamba de audio con recursos mínimos.
- Despliegue en CPU sin GPU: los GGUF F32/F16 se ejecutan en audio.cpp con backend CPU, lo que facilita pruebas en entornos sin acelerador.
- Evaluación comparativa de formatos: el repo incluye métricas de fidelidad por formato (MLX, GGUF F32, GGUF F16, navegador) útiles para decidir el formato de despliegue.
- Demo en navegador vía WebGPU: el Space asociado permite probar el modelo sin instalación local.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre VoiceBank-DEMAND test (16 kHz y 8 kHz) y sobre el conjunto degradado con reverberación, low-pass y clipping:

| Conjunto | Métrica | Ruidoso | Profesor (30 bloques) | RE-USE Lite | Ratio |
|---|---|---:|---:|---:|---:|
| VBD test 16 kHz | PESQ WB | 1,971 | 3,083 | 2,822 | 0,915 |
| VBD test 16 kHz | ESTOI | 0,787 | 0,890 | 0,865 | 0,972 |
| VBD test 16 kHz | SI-SDR (dB) | 8,445 | 19,152 | 18,425 | 0,962 |
| VBD test 16 kHz | DNSMOS OVRL | 2,697 | 3,291 | 3,227 | 0,980 |
| VBD test 8 kHz | PESQ NB | 2,946 | 3,907 | 3,668 | 0,939 |
| VBD test 8 kHz | ESTOI | 0,786 | 0,887 | 0,862 | 0,972 |
| VBD test 8 kHz | SI-SDR (dB) | 8,443 | 19,086 | 18,493 | 0,969 |
| Degradado | PESQ WB | 1,392 | 2,546 | 1,994 | 0,783 |
| Degradado | ESTOI | 0,471 | 0,811 | 0,708 | 0,873 |
| Degradado | SI-SDR (dB) | -7,794 | 3,860 | 0,537 | 0,139 |
| Degradado | DNSMOS OVRL | 1,913 | 3,289 | 3,109 | 0,945 |

Velocidad (PyTorch, Apple M4 GPU, mismo código y dispositivo para ambos): 5,51 veces más rápido a 16 kHz, 6,33 veces a 8 kHz y 12,43 veces en el conjunto degradado. Fidelidad de formatos respecto al modelo PyTorch en CPU (SI-SDR, mayor es mejor): GGUF F32 peor archivo 61,6 dB / media 70,9 dB; GGUF F16 peor archivo 58,6 dB / media 63,2 dB.

## Requisitos de hardware

- VRAM estimada: mínima; con 2,38 M parámetros, los pesos F32 ocupan aproximadamente 9,5 MB y los F16 unos 4,8 MB, más estados intermedios de audio.
- GPU recomendada: cualquier GPU moderna; el autor midió velocidad en Apple M4 GPU y entrenó en NVIDIA L4, pero no se publican cifras de VRAM ni de throughput en GPU discretas.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y también en CPU.
- Opciones de despliegue: audio.cpp (con patch de profundidad y commit `a6e32214e762aca6126eb7206a5497f11d064303`), versión MLX para Apple Silicon, PyTorch (safetensors) y demo WebGPU en navegador.
- Latencia y throughput: solo se publica el factor de velocidad relativo al profesor (5,51x a 16 kHz); no hay cifras absolutas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Velocidad relativa | PESQ WB (VBD 16k) | PESQ WB (degradado) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| NVIDIA NemotronLabs RE-USE (profesor) | 9.607.747 | 1x | 3,083 | 2,546 | openmdw-1.1 (según repo base) | Hugging Face (nvidia) |
| RE-USE Lite GGUF (este modelo) | 2.382.659 | 5,51x | 2,822 | 1,994 | openmdw-1.1 | GGUF, MLX, PyTorch, WebGPU |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- **Puerta de calidad fallida**: el autor declara FAILED en las tres reglas de calidad (VBD16, VBD8 y degradado); PESQ cae hasta 0,783 del profesor en el conjunto degradado y SI-SDR cae a 0,139.
- Entrenado solo con habla leída en inglés (VoiceBank-DEMAND); otros idiomas, canto y grabaciones de campo muy ruidosas están menos probados que en el profesor.
- Solo inferencia offline bidireccional; no apto para streaming en vivo.
- Puede suprimir hablantes solapados.
- Requiere audio.cpp parcheado con el commit indicado; la versión estándar solo carga modelos de 30 bloques.
- Q8_0 descartado por deriva de 25-35 dB respecto a PyTorch; usar F32 o F16.
- Modelo no oficial, sin afiliación ni respaldo de NVIDIA.
- Licencia openmdw-1.1: conviene revisar las condiciones para uso comercial antes de desplegar.
- Riesgo de alucinación acústica (artefactos introducidos) en señales fuera de distribución.

## Enlaces

- Repo GGUF: https://huggingface.co/Lucasgitguy-co/RE-USE-Lite-GGUF
- Repo PyTorch: https://huggingface.co/Lucasgitguy-co/RE-USE-Lite
- Repo MLX: https://huggingface.co/Lucasgitguy-co/RE-USE-Lite-MLX
- Demo WebGPU: https://lucasgitguy-co-re-use-lite-web.static.hf.space/
- Space: https://huggingface.co/spaces/Lucasgitguy-co/RE-USE-Lite-web
- Modelo base: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-RE-USE
- audio.cpp: https://github.com/0xShug0/audio.cpp
- Dataset: https://huggingface.co/datasets/JacobLinCool/VoiceBank-DEMAND-16k
- Paper referenciado: arXiv 2603.02641
- Paper referenciado: arXiv 2606.25621
