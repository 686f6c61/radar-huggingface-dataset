# itsSHAS/dora-nano-ecg

## Resumen

DoraNano ECG es un modelo de clasificación de series temporales para electrocardiograma (ECG) desarrollado por Andrii Shumko (Praga) dentro del marco DORA (Dual Ontogenic Resonance Architecture) y publicado en Hugging Face por el usuario itsSHAS. No es un modelo generativo ni un transformer: está diseñado para inferencia embebida en microcontroladores y hardware médico implantable, con 18.280 FLOPs por latido, una huella binaria de 18,5 KB y cero asignaciones dinámicas de heap en Rust `no_std`.

Su objetivo es detectar latidos ventriculares ectópicos y discriminar ritmo sinusal normal en tiempo real, con un coste computacional y energético muy bajo. El autor declara una latencia de 3,33 µs por latido en un host x86_64 a 3,4 GHz y ~500 µs (~32.000 ciclos) en un ARM Cortex-M4 a 64 MHz, además de un presupuesto de ~10,62 µJ por ciclo y un 99,94% de ciclo en deep sleep/WFI.

Es relevante para desarrolladores de firmware e investigadores en monitorización cardíaca porque ofrece una alternativa determinista y de licencia MIT para evaluación en el protocolo inter-paciente DS2 de MIT-BIH. Los resultados declarados —98,01% de sensibilidad ventricular y 98,27% de especificidad normal— no están verificados de forma independiente y no constituyen validación clínica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DORA (Dual Ontogenic Resonance Architecture), modelo de series temporales para ECG; no es transformer ni LLM |
| Parámetros totales | No disponible; el autor no declara recuento de parámetros. Reporta 18.280 FLOPs por latido y 18,5 KB de binario |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica / no disponible; la inferencia es por latido y no se declara ventana de señal |
| Tipos de cuantización | No disponible; no se documentan cuantizaciones. El despliegue es un binario Rust `no_std` con aritmética determinista |
| Idiomas soportados | No aplica; metadatos en inglés (`en`). La entrada es una señal ECG, no texto |
| Licencia | MIT |
| Formato de pesos | No disponible; no se publican pesos en safetensors, GGUF ni formatos equivalentes. Se distribuye código Rust y arnés de evaluación; el repositorio figura con 0,0 GB |

## Arquitectura y entrenamiento

DORA combina seguimiento acoplado de línea base y dinámica de memoria de resonancia dispersa. La parte "ontogénica" se refiere a una autoorganización topológica dinámica que parte de una única unidad somática, mientras que la "resonancia" alinea formas de onda en un espacio de fases acotado entre -1 y 1 sin operaciones matriciales densas. El resultado es un clasificador determinista orientado a señales temporales continuas, no un modelo de lenguaje ni una red transformer convencional.

El conjunto de datos declarado es MIT-BIH Arrhythmia Database (`mitdb`). La evaluación se realiza con el protocolo inter-paciente DS2 sobre 22 pacientes no vistos y 44.168 latidos, según el autor. No se detalla el número de parámetros, la composición exacta del conjunto de entrenamiento, el número de épocas, la aumentación de datos ni la función de pérdida. Tampoco se declara RLHF/DPO, algo que no aplica a un clasificador de ECG.

## Capacidades

- Clasificación de latidos en el contexto evaluado: latido ventricular ectópico frente a ritmo sinusal normal.
- Inferencia determinista con 18.280 FLOPs por latido y cero asignaciones dinámicas de heap.
- Integración en firmware Rust `no_std` para microcontroladores y dispositivos de recursos limitados.
- Ejecución medida en host x86_64 a 3,4 GHz y modelada en ARM Cortex-M4 a 64 MHz con FPU.
- Presupuesto energético declarado de ~10,62 µJ por ciclo y 99,94% de ciclo en deep sleep/WFI, según modelo analítico.
- Métrica declarada de seguridad para desfibrilador ICD: 0 descargas inapropiadas en 39.234 latidos normales, no verificada.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni generación de texto.
- No tiene modo thinking, decodificación especulativa ni capacidades multilingües; los metadatos están en inglés y la entrada es una señal ECG.

## Casos de uso

- **Monitorización Holter portátil:** ejecutar la clasificación por latido en un microcontrolador Cortex-M4 con una huella de 18,5 KB y ~500 µs por latido, almacenando solo los eventos candidatos para reducir consumo y memoria.
- **Cribado en parches ECG wearables:** usar el modelo como etapa de detección local de latidos ventriculares ectópicos y activar una transmisión o alerta solo cuando aparezca un patrón anómalo.
- **Seguridad de desfibriladores implantables:** emplear la alta especificidad declarada sobre ritmo sinusal normal como comprobación secundaria para reducir descargas inapropiadas, siempre con validación regulatoria y supervisión clínica.
- **Telemonitorización remota de pacientes:** prefiltrar en el dispositivo señales ECG continuas y enviar al servidor únicamente segmentos sospechosos, disminuyendo ancho de banda y coste de almacenamiento.
- **Firmware de monitor cardíaco implantable:** integrar el modelo en Rust `no_std` con cero heap y comportamiento determinista, adecuado para sistemas con restricciones estrictas de memoria y planificación temporal.
- **Investigación reproducible en modelos embebidos:** utilizar el arnés de evaluación del repositorio para comparar clasificadores de ECG con presupuestos de 18.280 FLOPs por latido sobre MIT-BIH DS2.
- **Sistemas de alarma en monitorización bedside:** priorizar alarmas de arritmia ventricular usando la sensibilidad declarada del 98,01%, con revisión humana obligatoria antes de cualquier actuación clínica.
- **Dispositivos médicos de bajo consumo:** aprovechar el ciclo de deep sleep/WFI del 99,94% para extender la vida útil de la batería en parches y wearables que analizan ECG de forma intermitente.

## Benchmarks y rendimiento

| Benchmark / métrica | Conjunto / split | Resultado | Verificación |
|---|---|---|---|
| Sensibilidad ventricular (recall) | MIT-BIH Arrhythmia Database, test DS2, 22 pacientes, 44.168 latidos | 98,01% (2.855/2.913) | No verificado (`verified: false`) |
| Especificidad de ritmo sinusal normal | MIT-BIH Arrhythmia Database, test DS2 | 98,27% (38.555/39.234) | No verificado (`verified: false`) |
| Descargas inapropiadas de desfibrilador en corazón normal | MIT-BIH Arrhythmia Database, test DS2 | 0/39.234 (0,0000%) | No verificado (`verified: false`) |
| Puntuación de seguridad para desfibrilador ICD | MIT-BIH Arrhythmia Database, test DS2 | 100,0000% | No verificado (`verified: false`) |

| Métrica de inferencia | Valor | Contexto |
|---|---|---|
| Latencia | 3,33 µs por latido | Medida en host x86_64 a 3,4 GHz |
| Latencia en MCU | ~500 µs (~32.000 ciclos) | Modelo analítico, ARM Cortex-M4 a 64 MHz con FPU |
| Huella binaria | 18,5 KB | Medida (LLVM/MSVC `.text` + `.rdata`, cero heap) |
| Complejidad algorítmica | 18.280 FLOPs por latido | Conteo aritmético determinista |
| Energía de CPU | ~10,62 µJ por ciclo | Modelo analítico; 99,94% deep sleep/WFI |

## Requisitos de hardware

- **VRAM estimada:** no aplica / no disponible. El modelo no se publica como pesos para GPU; el despliegue previsto es CPU o microcontrolador. No se declara VRAM.
- **GPU recomendadas:** no aplica. No se publican GPU recomendadas; la latencia medida es en host x86_64 y la modelada en ARM Cortex-M4.
- **GPU de consumo:** no procede. No necesita una GPU consumer; el objetivo es microcontrolador. No se publica variante GPU.
- **Memoria:** huella binaria de 18,5 KB y cero asignaciones dinámicas de heap. La RAM pico no está disponible.
- **Despliegue:** binario Rust `no_std` y arnés de evaluación en GitHub. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un LLM.
- **Latencia:** 3,33 µs por latido en host x86_64 a 3,4 GHz (medida); ~500 µs (~32.000 ciclos) en ARM Cortex-M4 a 64 MHz (modelo analítico).
- **Throughput:** no publicado. No se declara throughput sostenido.
- **Energía:** ~10,62 µJ por ciclo (modelo analítico) y 99,94% de ciclo en deep sleep/WFI; no se indica medición en silicio.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DoraNano ECG | DORA, series temporales, embebido | No disponible (18.280 FLOPs por latido; 18,5 KB) | No aplica | 98,01% recall ventricular; 98,27% especificidad normal en MIT-BIH DS2 (no verificado) | MIT | Hugging Face y GitHub |
| DeepECG-Net | Transformer híbrido con CNN para anomalías ECG | No disponible | No aplica | No disponible en la información | No disponible | Artículo en Nature; código no indicado |
| Modelo interpretable ECG con SHAP/LIME | ML interpretable para ECG | No disponible | No aplica | No disponible en la información | No disponible | Artículo en ScienceDirect; código no indicado |

No se dispone de una comparación numérica homogénea con los datos proporcionados. DoraNano ECG destaca por su huella de 18,5 KB y su orientación a microcontroladores; los modelos alternativos encontrados no publican en la información disponible parámetros, contexto, licencia ni resultados comparables.

## Limitaciones y advertencias

- Los resultados están declarados por el autor y marcados como no verificados; no se han encontrado validaciones independientes en la información disponible.
- No es un dispositivo médico ni está certificado para diagnóstico, monitorización clínica o control autónomo de desfibriladores.
- La evaluación se limita a MIT-BIH DS2, con 22 pacientes y 44.168 latidos; no se documentan sesgos demográficos, de derivación, de dispositivo ni de etiquetado.
- La puntuación de seguridad para ICD no es una métrica estándar; se deriva de 0 descargas inapropiadas en 39.234 latidos normales y no garantiza seguridad clínica.
- La latencia en MCU y el consumo energético son modelos analíticos, no mediciones en hardware real.
- No se publican recuento de parámetros, RAM pico, pesos, proceso de entrenamiento ni curvas de validación.
- No aplica el riesgo de alucinación típico de un LLM; el riesgo real es de falsos positivos y falsos negativos en la clasificación.
- La licencia MIT permite uso comercial del código con aviso de copyright, pero no exime de los requisitos regulatorios sanitarios.
- No soporta texto, tool calling, agentes, visión ni audio; los metadatos están en inglés y la entrada es una señal ECG.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/itsSHAS/dora-nano-ecg)
- [Repositorio GitHub](https://github.com/Ashixi/dora-nano-ecg)
- [README del repositorio](https://github.com/Ashixi/dora-nano-ecg/blob/main/README.md)
- [DeepECG-Net en Nature](https://www.nature.com/articles/s41598-025-07781-1)
- [Modelo interpretable ECG con SHAP/LIME en ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2590123024016347)
