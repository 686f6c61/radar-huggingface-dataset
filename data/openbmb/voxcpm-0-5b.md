# openbmb/VoxCPM-0.5B

## Resumen

VoxCPM-0.5B es un sistema de síntesis de voz (TTS) desarrollado por OpenBMB que elimina la tokenización discreta del audio. En lugar de convertir el habla en tokens discretos como hacen los sistemas convencionales, genera directamente representaciones continuas mediante una arquitectura autoregresiva de difusión de extremo a extremo construida sobre el backbone MiniCPM-4 de 0,5 mil millones de parámetros. El modelo fue entrenado con 1,8 millones de horas de habla bilingüe (inglés y chino) y ofrece dos capacidades principales: generación de habla consciente del contexto (adapta la prosodia al contenido del texto) y clonación de voz zero-shot con alta fidelidad.

Publicado bajo licencia Apache 2.0, su tamaño compacto (repositorio de 2,9 GB) permite ejecutarlo en GPUs de consumo, alcanzando un factor de tiempo real (RTF) de 0,17 en una NVIDIA RTX 4090, lo que lo hace viable para aplicaciones en tiempo real. El proyecto cuenta con una demo interactiva, página de muestras y una versión más reciente (VoxCPM2, 2B parámetros) ya publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion autoregressive (LocDiT) sobre backbone MiniCPM-4 |
| Parámetros totales | 0,5 mil millones |
| Parámetros activos | no aplica (modelo denso, no MoE) |
