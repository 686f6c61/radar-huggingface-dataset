# Snapkitty/sovereign-doorbell

## Resumen

El repositorio `Snapkitty/sovereign-doorbell` no contiene un modelo de inteligencia artificial, sino un proyecto de hardware y firmware de código abierto denominado "Sovereign Doorbell". Desarrollado por Ahmad Ali Parr bajo un trust, este proyecto define un mecanismo de notificación determinista ("doorbell kick") para un fabric de silicio llamado ORTHO-32-T. Su objetivo es eliminar la varianza temporal en operaciones de entrada/salida de baja latencia, mediante una secuencia de seis instrucciones x86-64 verificadas formalmente desde ensamblador hasta silicio.

No se trata de un modelo con parámetros, contexto o licencia de IA. La información disponible en HuggingFace es mínima: sin pipeline, sin licencia, sin idiomas, y con cero descargas. La model card describe un sistema de hardware con verificación formal en Lean 4 e Idris 2, y un diseño RTL en Chisel 6.2. Por tanto, esta ficha se limita a documentar el proyecto tal cual, indicando que no aplica como modelo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (proyecto de hardware/firmware, no red neuronal) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | BSL-1.1 (según insignia en model card) |
| Formato de pesos | No disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe entrenamiento en el sentido de modelos de IA. El proyecto describe una arquitectura de sistema que combina:

- Una secuencia de seis instrucciones x86-64 (`sfence`, `lfence+rdtsc`, `mov` de escritura, `mov` de lectura, `lfence+rdtsc`, `sub`) para medir el tiempo de ida y vuelta de un "doorbell kick" sobre PCIe.
- Un puente ABI (`woz_abi_thunk`) que traduce entre la convención Windows x64 y System V AMD64.
- Una SMMU con memoria shadow ping-pong de doble puerto y un page walker de latencia fija de 3 ciclos.
- Un cluster de lockstep con desfase temporal de 2 ciclos para aislamiento de fallos.
- Una red NoC con planificación TDMA y un ancla de fase θ = 89/2462.
- Una cadena WORM (Write Once Read Many) con hash SHA-256 y firma Ed25519.

La verificación formal se realiza con Lean 4 e Idris 2, y el diseño RTL con Chisel 6.2. No hay datos de entrenamiento ni proceso de optimización de parámetros.

## Capacidades

- No es un modelo de IA; no genera texto, código, ni realiza razonamiento.
- El hardware implementa una función concreta: notificar a un fabric determinista que el trabajo está listo, midiendo con precisión de ciclo el tiempo de ida y vuelta.
- Proporciona una secuencia de instrucciones con varianza cero para operaciones MMIO sobre PCIe.
- Incluye verificación formal de las propiedades de la secuencia (sin "sorry" en las pruebas).
- Soporta integración con hypervisores tipo 1 y gestión de DMA/GPU.

## Casos de uso

- No aplica como modelo de IA. No hay casos de uso de generación de texto, código o razonamiento.
- El proyecto está orientado a sistemas embebidos deterministas, hypervisores de tiempo real y aceleración de hardware con requisitos de latencia estricta.
- Podría utilizarse en entornos de trading de alta frecuencia, control industrial en tiempo real o infraestructura de red de baja latencia.
- La medición precisa de round-trip PCIe es útil para depuración de drivers y validación de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni similares, al no tratarse de un modelo de IA.

## Requisitos de hardware

- El proyecto está diseñado para CPUs AMD Zen 4 (según la model card).
- Requiere una plataforma con PCIe y soporte de MMIO posted writes.
- Para la verificación formal se necesitan herramientas Lean 4 e Idris 2, así como Chisel 6.2 para síntesis RTL.
- No hay requisitos de VRAM ni GPU, ya que no es un modelo de inferencia.
- Las opciones de despliegue incluyen integración directa en un hypervisor o en firmware de bajo nivel.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables, ya que este repositorio no contiene un modelo de lenguaje o visión.

## Limitaciones y advertencias

- No es un modelo de IA; cualquier uso como tal es inapropiado.
- La licencia BSL-1.1 (Business Source License) puede imponer restricciones para uso comercial en ciertos escenarios; se debe revisar el texto completo.
- El proyecto está en fase de "patent pending", lo que podría afectar a su uso en productos comerciales.
- No hay documentación sobre compatibilidad con otras arquitecturas de CPU más allá de Zen 4.
- La verificación formal cubre la secuencia de instrucciones, pero no garantiza el comportamiento en todos los entornos de hardware posibles.
- No se proporcionan datos de rendimiento empírico (solo se menciona latencia de 40-60 ciclos para el posted write, sin mediciones publicadas).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/sovereign-doorbell
- No se encontraron otros enlaces (papers, blogs, repos) en la información proporcionada.
